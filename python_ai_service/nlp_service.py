"""BioBERT helpers.

BioBERT is an encoder (not a chatbot). Here it is used to turn the user's
question and each line of the report into vectors, then pick the report lines
whose meaning is closest to the question. Node then gives those lines to
Gemini, which writes the final answer.

Parameter extraction (LOW/HIGH/NORMAL) is NOT done here: Node does it with
plain, deterministic code.
"""
import hashlib
import re

BIOBERT_MODEL_NAME = "dmis-lab/biobert-base-cased-v1.1"
TOP_K = 6
STOP_WORDS = {"what", "why", "how", "does", "the", "and", "for", "are", "was", "mean", "means",
              "marked", "my", "this", "that", "with", "have", "has", "about", "can", "result", "results"}

_tokenizer = None
_model = None
_line_cache = {}  # report-text hash -> line vectors


def load_model():
    """Load BioBERT once, on first use (so the server starts fast)."""
    global _tokenizer, _model
    if _model is None:
        # Imported here so a missing torch install gives a clear error message.
        from transformers import BertModel, BertTokenizer

        print(f"[NLP] Loading {BIOBERT_MODEL_NAME} ...")
        _tokenizer = BertTokenizer.from_pretrained(BIOBERT_MODEL_NAME, do_lower_case=False)  # BioBERT v1.1 is cased
        _model = BertModel.from_pretrained(BIOBERT_MODEL_NAME)
        _model.eval()
        print("[NLP] BioBERT ready")
    return _tokenizer, _model


def embed(texts):
    """Return one vector per text (mean of BioBERT token vectors)."""
    import torch

    tokenizer, model = load_model()
    inputs = tokenizer(texts, padding=True, truncation=True, max_length=128, return_tensors="pt")
    with torch.no_grad():
        hidden = model(**inputs).last_hidden_state  # (batch, tokens, 768)
    mask = inputs["attention_mask"].unsqueeze(-1)  # ignore padding tokens
    vectors = (hidden * mask).sum(dim=1) / mask.sum(dim=1)
    return torch.nn.functional.normalize(vectors, dim=1)


def split_report_lines(report_text: str):
    """Report lines worth searching (skip blank and very short lines)."""
    lines = [line.strip() for line in report_text.splitlines()]
    # Skip very short lines and lines that are mostly symbols (OCR noise).
    return [line for line in lines if len(line) > 3 and sum(c.isalnum() for c in line) / len(line) > 0.5]


def get_medical_context(question: str, report_text: str):
    """Return the report lines most relevant to the question, ranked by BioBERT."""
    lines = split_report_lines(report_text)
    if not lines:
        return {"context": "", "matched_terms": [], "method": "none"}

    # Cap the work so one huge report cannot make the request very slow.
    lines = lines[:400]

    # Report lines are embedded once and remembered, so the next question about the
    # same report only has to embed the question (much faster).
    key = hashlib.sha1(chr(10).join(lines).encode("utf-8")).hexdigest()
    if key not in _line_cache:
        if len(_line_cache) >= 20:  # keep memory small
            _line_cache.pop(next(iter(_line_cache)))
        _line_cache[key] = embed(lines)
    line_vectors = _line_cache[key]
    question_vector = embed([question])[0]
    scores = (line_vectors @ question_vector).tolist()  # cosine similarity (vectors are normalised)

    # BioBERT alone is not trained for sentence matching, so add a boost when the
    # line contains a word from the question (e.g. the test name "MCV").
    question_words = {w for w in re.findall(r"[A-Za-z0-9]+", question.lower()) if len(w) > 2 and w not in STOP_WORDS}
    for i, line in enumerate(lines):
        line_words = set(re.findall(r"[A-Za-z0-9]+", line.lower()))
        scores[i] += 1.0 * len(question_words & line_words)

    ranked = sorted(range(len(lines)), key=lambda i: scores[i], reverse=True)[:TOP_K]
    ranked.sort()  # put chosen lines back in report order so they read naturally
    return {
        "context": "\n".join(lines[i] for i in ranked),
        "matched_terms": [lines[i] for i in ranked],
        "method": "biobert",
    }
