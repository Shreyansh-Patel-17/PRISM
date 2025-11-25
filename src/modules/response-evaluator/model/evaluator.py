from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from textblob import TextBlob
from sentence_transformers import SentenceTransformer, util
import nltk

# NOTE: Keep the following lines for dependency and model loading
nltk.download('punkt')
nltk.download('stopwords')
model = SentenceTransformer('all-MiniLM-L6-v2') 

# --- Updated semantic_keyword_score function (Handles Custom Weights) ---
def semantic_keyword_score(response, expected_keywords_weighted, threshold=0.7):
    # Fallback values in case of error
    fallback_score = 0.0
    fallback_matched = []
    fallback_semantic_scores = {item['keyword']: 0.0 for item in expected_keywords_weighted}

    try:

        # 1. Extract raw keywords, weights, and total weight
        raw_keywords = [item['keyword'] for item in expected_keywords_weighted]
        weights = [item['weight'] for item in expected_keywords_weighted]
        total_possible_weight = sum(weights)
        
        if not raw_keywords:
            return 0.0, [], {}

        # 2. Calculate semantic similarity
        response_embedding = model.encode(response, convert_to_tensor=True)
        keyword_embeddings = model.encode(raw_keywords, convert_to_tensor=True)
        scores = util.cos_sim(response_embedding, keyword_embeddings)[0]

        # 3. Calculate WEIGHTED score
        matched_weight_sum = 0
        matched_keywords = []
        semantic_scores = {}

        for i, score in enumerate(scores):
            keyword_item = expected_keywords_weighted[i]
            keyword = keyword_item['keyword']
            weight = keyword_item['weight']
            
            semantic_scores[keyword] = round(float(score), 3)

            if score >= threshold:
                matched_weight_sum += weight
                matched_keywords.append(keyword)

        score = matched_weight_sum / total_possible_weight if total_possible_weight > 0 else 0
        
        return round(score * 100, 2), matched_keywords, semantic_scores
    
    except Exception as e:
        # Log the error for debugging purposes (in a real system)
        print(f"ERROR in semantic_keyword_score: {e}")
        # Return sensible fallback values instead of crashing
        return fallback_score, fallback_matched, fallback_semantic_scores

# --- sentiment_score and interpret_sentiment remain the same ---
def sentiment_score(response):
    polarity = TextBlob(response).sentiment.polarity
    return round((polarity + 1) * 50, 2)

def interpret_sentiment(score):
    if score >= 65:
        return "positive"
    elif score >= 45:
        return "neutral"
    else:
        return "negative"

# --- Updated evaluate_response function (Includes Detailed Output) ---
def evaluate_response(response, question_obj, kw_weight=0.8, sent_weight=0.2):

    try:
        question_text = question_obj["text"]
        # Expects list of dictionaries: e.g., [{'keyword': 'python', 'weight': 1.5}, ...]
        expected_keywords_weighted = question_obj.get("expected_keywords", [])

        kw_score, matched, semantic_scores = semantic_keyword_score(response, expected_keywords_weighted)
        sent_score = sentiment_score(response)
        final_score = round(kw_weight * kw_score + sent_weight * sent_score, 2)

        # Logic to find missing keywords
        all_keywords = [item['keyword'] for item in expected_keywords_weighted]
        missing = [kw for kw in all_keywords if kw not in matched]
        
        sentiment_label = interpret_sentiment(sent_score)
        suggestion = f"Try mentioning: {', '.join(missing)}." if missing else ""

        result = {
            "question": question_text,
            "response": response,
            "scores": {
                # TASK 2: Full Score Breakdown
                "keyword": kw_score,
                "sentiment": sent_score,
                "final": final_score,
                "weights": {
                    "keyword_weight": kw_weight,
                    "sentiment_weight": sent_weight
                }
            },
            "feedback": {
                "matched_keywords": matched,
                "missing_keywords": missing,
                "sentiment": sentiment_label,
                "suggestion": suggestion,
                # TASK 3: Individual Keyword Score Detail
                "keyword_detail": semantic_scores 
            }
        }
        
        return result
    
    except Exception as e:
        # Catch fatal errors (e.g., malformed question_obj input)
        print(f"FATAL ERROR in evaluate_response: {e}")
        # Return a guaranteed fallback structure with a neutral/error score
        return {
            "question": question_obj.get("text", "Error: Unknown Question"),
            "response": response,
            "scores": {"keyword": 0.0, "sentiment": 50.0, "final": 25.0,
                       "weights": {"keyword_weight": 0.8, "sentiment_weight": 0.2}},
            "feedback": {"matched_keywords": [], "missing_keywords": ["System Error"],
                         "sentiment": "neutral", "suggestion": "Evaluation failed due to system error.",
                         "keyword_detail": {}}
        }