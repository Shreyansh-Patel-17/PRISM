from textblob import TextBlob
from sentence_transformers import SentenceTransformer, util
from functools import lru_cache

# -----------------------------
# Lazy-loaded global model
# -----------------------------

_MODEL = None


def get_embedding_model():
    """
    Lazily initialize and cache the SentenceTransformer model.
    Ensures the model is only loaded once per Python process.
    """
    global _MODEL
    if _MODEL is None:
        # You can swap model name here if needed
        _MODEL = SentenceTransformer("all-MiniLM-L6-v2")
    return _MODEL


# -----------------------------
# Cached keyword embeddings
# -----------------------------

@lru_cache(maxsize=256)
def get_keyword_embeddings(keywords_tuple):
    """
    Given a tuple of keyword strings, return a cached tensor of embeddings.
    Using a tuple makes it hashable for lru_cache.
    """
    if not keywords_tuple:
        return None
    model = get_embedding_model()
    # Convert tuple back to list for encoding
    return model.encode(list(keywords_tuple), convert_to_tensor=True)


# --- Optimized semantic_keyword_score (With Caching + Weights) --- #
def semantic_keyword_score(response, expected_keywords_weighted, threshold=0.7):
    """
    Compute a weighted semantic keyword score between 0 and 100.

    expected_keywords_weighted: list of dicts like:
        [{"keyword": "python", "weight": 1.5}, ...]

    Returns:
        (score_0_to_100, matched_keywords_list, per_keyword_similarity_dict)
    """
    # Fallback values in case of error
    fallback_score = 0.0
    fallback_matched = []
    fallback_semantic_scores = {
        item["keyword"]: 0.0 for item in expected_keywords_weighted
    }

    try:
        # 1. Extract raw keywords, weights, and total weight
        raw_keywords = [item["keyword"] for item in expected_keywords_weighted]
        weights = [item["weight"] for item in expected_keywords_weighted]
        total_possible_weight = sum(weights)

        if not raw_keywords or total_possible_weight <= 0:
            return 0.0, [], {}

        # 2. Get embeddings (with caching for keyword side)
        model = get_embedding_model()
        response_embedding = model.encode(response, convert_to_tensor=True)

        # Use cached embeddings for keywords
        keyword_embeddings = get_keyword_embeddings(tuple(raw_keywords))
        if keyword_embeddings is None:
            return 0.0, [], {}

        scores = util.cos_sim(response_embedding, keyword_embeddings)[0]

        # 3. Calculate WEIGHTED score
        matched_weight_sum = 0.0
        matched_keywords = []
        semantic_scores = {}

        for i, score in enumerate(scores):
            keyword_item = expected_keywords_weighted[i]
            keyword = keyword_item["keyword"]
            weight = float(keyword_item.get("weight", 1.0))

            # Record raw similarity for detail
            sim = float(score)
            semantic_scores[keyword] = round(sim, 3)

            if sim >= threshold:
                matched_weight_sum += weight
                matched_keywords.append(keyword)

        score = (
            matched_weight_sum / total_possible_weight
            if total_possible_weight > 0
            else 0.0
        )

        return round(score * 100, 2), matched_keywords, semantic_scores

    except Exception as e:
        # Log the error for debugging purposes (in a real system, use proper logging)
        print(f"ERROR in semantic_keyword_score: {e}")
        # Return sensible fallback values instead of crashing
        return fallback_score, fallback_matched, fallback_semantic_scores


# --- sentiment_score and interpret_sentiment stay simple/cheap --- #
def sentiment_score(response):
    polarity = TextBlob(response).sentiment.polarity  # -1..1
    return round((polarity + 1) * 50, 2)  # -> 0..100


def interpret_sentiment(score):
    if score >= 65:
        return "positive"
    elif score >= 45:
        return "neutral"
    else:
        return "negative"


# --- Optimized evaluate_response --- #
def evaluate_response(response, question_obj, kw_weight=0.8, sent_weight=0.2):
    """
    Evaluate a response against a question and expected keywords.

    question_obj format:
    {
        "text": "What is ...?",
        "expected_keywords": [
            {"keyword": "python", "weight": 1.0}, ...
        ]
    }
    """
    try:
        question_text = question_obj["text"]
        expected_keywords_weighted = question_obj.get("expected_keywords", [])

        kw_score, matched, semantic_scores = semantic_keyword_score(
            response, expected_keywords_weighted
        )
        sent_score = sentiment_score(response)

        # Normalize weights if they don't sum to 1 (optional safety)
        total_weight = kw_weight + sent_weight
        if total_weight <= 0:
            kw_w_norm, sent_w_norm = 0.8, 0.2
        else:
            kw_w_norm = kw_weight / total_weight
            sent_w_norm = sent_weight / total_weight

        final_score = round(
            kw_w_norm * kw_score + sent_w_norm * sent_score, 2
        )

        # Missing keywords
        all_keywords = [item["keyword"] for item in expected_keywords_weighted]
        missing = [kw for kw in all_keywords if kw not in matched]

        sentiment_label = interpret_sentiment(sent_score)
        suggestion = (
            f"Try mentioning: {', '.join(missing)}." if missing else ""
        )

        result = {
            "question": question_text,
            "response": response,
            "scores": {
                "keyword": kw_score,
                "sentiment": sent_score,
                "final": final_score,
                "weights": {
                    "keyword_weight": kw_w_norm,
                    "sentiment_weight": sent_w_norm,
                },
            },
            "feedback": {
                "matched_keywords": matched,
                "missing_keywords": missing,
                "sentiment": sentiment_label,
                "suggestion": suggestion,
                "keyword_detail": semantic_scores,
            },
        }

        return result

    except Exception as e:
        # Catch fatal errors (e.g., malformed question_obj input)
        print(f"FATAL ERROR in evaluate_response: {e}")
        # Guaranteed fallback structure
        return {
            "question": question_obj.get("text", "Error: Unknown Question"),
            "response": response,
            "scores": {
                "keyword": 0.0,
                "sentiment": 50.0,
                "final": 25.0,
                "weights": {
                    "keyword_weight": 0.8,
                    "sentiment_weight": 0.2,
                },
            },
            "feedback": {
                "matched_keywords": [],
                "missing_keywords": ["System Error"],
                "sentiment": "neutral",
                "suggestion": "Evaluation failed due to system error.",
                "keyword_detail": {},
            },
        }
