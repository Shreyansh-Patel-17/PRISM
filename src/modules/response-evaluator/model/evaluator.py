# import nltk
# from nltk.tokenize import word_tokenize
# from nltk.corpus import stopwords
# from textblob import TextBlob

# nltk.download('punkt')
# nltk.download('stopwords')


# def keyword_score(response, expected_keywords):
#     tokens = word_tokenize(response.lower())
#     stop_words = set(stopwords.words('english'))
#     filtered = [word for word in tokens if word.isalpha() and word not in stop_words]
#     matched = [word for word in filtered if word in expected_keywords]
#     score = len(matched) / len(expected_keywords) if expected_keywords else 0
#     return round(score * 100, 2), matched

# def sentiment_score(response):
#     polarity = TextBlob(response).sentiment.polarity
#     return round((polarity + 1) * 50, 2)

# def interpret_sentiment(score):
#      if score >= 65:
#          return "positive"
#      elif score >= 45:
#          return "neutral"
#      else:
#         return "negative"

# def evaluate_response(response, question_obj, kw_weight=0.8, sent_weight=0.2):
#     question_text = question_obj["text"]
#     expected_keywords = question_obj.get("expected_keywords", [])
    
#     kw_score, matched = keyword_score(response, expected_keywords)
#     sent_score = sentiment_score(response)
#     final_score = round(kw_weight * kw_score + sent_weight * sent_score, 2)
    
#     missing = [kw for kw in expected_keywords if kw not in matched]
#     sentiment_label = interpret_sentiment(sent_score)
    
#     suggestion = ""
#     if missing:
#         suggestion = f"Try mentioning: {', '.join(missing)}."

#     return {
#         "question": question_text,
#         "response": response,
#         "scores": {
#             "keyword": kw_score,
#             "sentiment": sent_score,
#             "final": final_score
#         },
#         "feedback": {
#             "matched_keywords": matched,
#             "missing_keywords": missing,
#             "sentiment": sentiment_label,
#             "suggestion": suggestion
#         }
#     }










# evaluator.py

from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from textblob import TextBlob
from sentence_transformers import SentenceTransformer, util
import nltk

nltk.download('punkt')
nltk.download('stopwords')

# Load offline embedding model
model = SentenceTransformer('all-MiniLM-L6-v2')

def semantic_keyword_score(response, expected_keywords, threshold=0.7):
    response_embedding = model.encode(response, convert_to_tensor=True)
    keyword_embeddings = model.encode(expected_keywords, convert_to_tensor=True)
    scores = util.cos_sim(response_embedding, keyword_embeddings)[0]

    matched = [kw for kw, score in zip(expected_keywords, scores) if score >= threshold]
    semantic_scores = {kw: round(float(score), 3) for kw, score in zip(expected_keywords, scores)}
    score = len(matched) / len(expected_keywords) if expected_keywords else 0
    return round(score * 100, 2), matched, semantic_scores

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

def evaluate_response(response, question_obj, kw_weight=0.8, sent_weight=0.2, debug=False):
    question_text = question_obj["text"]
    expected_keywords = question_obj.get("expected_keywords", [])

    kw_score, matched, semantic_scores = semantic_keyword_score(response, expected_keywords)
    sent_score = sentiment_score(response)
    final_score = round(kw_weight * kw_score + sent_weight * sent_score, 2)

    missing = [kw for kw in expected_keywords if kw not in matched]
    sentiment_label = interpret_sentiment(sent_score)

    suggestion = f"Try mentioning: {', '.join(missing)}." if missing else ""

    result = {
        "question": question_text,
        "response": response,
        "scores": {
            "keyword": kw_score,
            "sentiment": sent_score,
            "final": final_score
        },
        "feedback": {
            "matched_keywords": matched,
            "missing_keywords": missing,
            "sentiment": sentiment_label,
            "suggestion": suggestion
        }
    }

    if debug:
        result["debug"] = {
            "semantic_scores": semantic_scores,
            "tokenized_response": word_tokenize(response.lower()),
            "stopwords_removed": [word for word in word_tokenize(response.lower()) if word.isalpha() and word not in stopwords.words('english')]
        }

    return result