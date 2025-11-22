import streamlit as st
import pandas as pd
import altair as alt

# Inject custom CSS for chart and feedback boxes
st.markdown("""
    <style>
    .chart-box {
        border: 2px solid #2C2C2C;
        border-radius: 10px;
        padding: 1.5em;
        background-color: #CFCFCF;  /* Darker gray */
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        margin-bottom: 2em;
    }
    .summary-box {
        border: 2px solid #5A3E2B;
        border-radius: 10px;
        padding: 1.2em;
        background-color: #F5ECE3;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        margin-bottom: 1.5em;
    }
    </style>
""", unsafe_allow_html=True)

# Simulated evaluation results
results = [
    {
        "question": "Tell me about your experience with Python",
        "response": "I use Python for data analysis and automation. It's my favorite programming language.",
        "scores": {"keyword": 80.0, "sentiment": 75.0, "final": 79.0},
        "feedback": {
            "matched_keywords": ["python", "data", "automation", "programming"],
            "missing_keywords": ["scripting"],
            "sentiment": "positive",
            "suggestion": "Try mentioning: scripting."
        }
    },
    {
        "question": "What is OOP?",
        "response": "OOP is about using classes and objects. It includes inheritance and encapsulation.",
        "scores": {"keyword": 40.0, "sentiment": 50.0, "final": 42.0},
        "feedback": {
            "matched_keywords": ["inheritance", "encapsulation"],
            "missing_keywords": ["object", "class", "polymorphism"],
            "sentiment": "neutral",
            "suggestion": "Try mentioning: object, class, polymorphism."
        }
    }
]

# App title
st.title("Interview Response Evaluation Dashboard")

# Final Score Chart with styled container
st.markdown('<div class="chart-box">', unsafe_allow_html=True)
st.markdown("### Final Scores per Question")

# Prepare data
questions = [r["question"] for r in results]
scores = [r["scores"]["final"] for r in results]
score_df = pd.DataFrame({"Question": questions, "Score": scores})

# Custom Altair chart
chart = alt.Chart(score_df).mark_bar(
    color="#B7410E",
    cornerRadiusTopLeft=4,
    cornerRadiusTopRight=4
).encode(
    x=alt.X("Question", sort=None),
    y=alt.Y("Score", scale=alt.Scale(domain=[0, 100]))
).properties(height=300)

st.altair_chart(chart, use_container_width=True)
st.markdown('</div>', unsafe_allow_html=True)

# Detailed Feedback Section
st.subheader("Detailed Feedback")
for r in results:
    st.markdown(f"""
        <div class="summary-box">
            <strong>Question:</strong> {r['question']}<br>
            <strong>Response:</strong> {r['response']}<br>
            <strong>Final Score:</strong> {r['scores']['final']}%<br>
            <strong>Sentiment:</strong> {r['feedback']['sentiment']}<br>
            <strong>Matched Keywords:</strong> {', '.join(r['feedback']['matched_keywords'])}<br>
            <strong>Missing Keywords:</strong> {', '.join(r['feedback']['missing_keywords'])}<br>
            <strong>Suggestion:</strong> {r['feedback']['suggestion']}
        </div>
    """, unsafe_allow_html=True)








# import streamlit as st
# import pandas as pd
# import altair as alt

# # Inject custom CSS for chart and feedback boxes
# st.markdown("""
#     <style>
#     .chart-box {
#         border: 2px solid #2C2C2C;
#         border-radius: 10px;
#         padding: 1.5em;
#         background-color: #CFCFCF;
#         box-shadow: 0 2px 6px rgba(0,0,0,0.15);
#         margin-bottom: 2em;
#     }
#     .summary-box {
#         border: 2px solid #5A3E2B;
#         border-radius: 10px;
#         padding: 1.2em;
#         background-color: #F5ECE3;
#         box-shadow: 0 2px 6px rgba(0,0,0,0.1);
#         margin-bottom: 1.5em;
#     }
#     </style>
# """, unsafe_allow_html=True)

# # Simulated evaluation results
# results = [
#     {
#         "question": "Tell me about your experience with Python",
#         "response": "I use Python for data analysis and automation. It's my favorite programming language.",
#         "scores": {"keyword": 80.0, "sentiment": 75.0, "final": 79.0},
#         "feedback": {
#             "matched_keywords": ["python", "data", "automation", "programming"],
#             "missing_keywords": ["scripting"],
#             "sentiment": "positive",
#             "suggestion": "Try mentioning: scripting."
#         }
#     },
#     {
#         "question": "What is OOP?",
#         "response": "OOP is about using classes and objects. It includes inheritance and encapsulation.",
#         "scores": {"keyword": 40.0, "sentiment": 50.0, "final": 42.0},
#         "feedback": {
#             "matched_keywords": ["inheritance", "encapsulation"],
#             "missing_keywords": ["object", "class", "polymorphism"],
#             "sentiment": "neutral",
#             "suggestion": "Try mentioning: object, class, polymorphism."
#         }
#     }
# ]

# # App title
# st.title("Interview Response Evaluation Dashboard")

# # Final Score Chart with styled container
# st.markdown('<div class="chart-box">', unsafe_allow_html=True)
# st.markdown("### Final Scores per Question")

# # Prepare data
# questions = [r["question"] for r in results]
# scores = [r["scores"]["final"] for r in results]
# score_df = pd.DataFrame({"Question": questions, "Score": scores})

# # Altair chart with enhanced grid and axis lines
# chart = alt.Chart(score_df).mark_bar(
#     color="#B7410E",
#     cornerRadiusTopLeft=4,
#     cornerRadiusTopRight=4
# ).encode(
#     x=alt.X("Question", sort=None,
#         axis=alt.Axis(
#             labelColor="#2C2C2C",
#             titleColor="#2C2C2C",
#             domain=True,
#             domainColor="#444444",
#             tickColor="#444444",
#             grid=True,
#             gridColor="#AAAAAA",
#             gridOpacity=1
#         )
#     ),
#     y=alt.Y("Score", scale=alt.Scale(domain=[0, 100]),
#         axis=alt.Axis(
#             labelColor="#2C2C2C",
#             titleColor="#2C2C2C",
#             domain=True,
#             domainColor="#444444",
#             tickColor="#444444",
#             grid=True,
#             gridColor="#AAAAAA",
#             gridOpacity=1
#         )
#     )
# ).properties(height=300)

# st.altair_chart(chart, use_container_width=True)
# st.markdown('</div>', unsafe_allow_html=True)

# # Detailed Feedback Section
# st.subheader("Detailed Feedback")
# for r in results:
#     st.markdown(f"""
#         <div class="summary-box">
#             <strong>Question:</strong> {r['question']}<br>
#             <strong>Response:</strong> {r['response']}<br>
#             <strong>Final Score:</strong> {r['scores']['final']}%<br>
#             <strong>Sentiment:</strong> {r['feedback']['sentiment']}<br>
#             <strong>Matched Keywords:</strong> {', '.join(r['feedback']['matched_keywords'])}<br>
#             <strong>Missing Keywords:</strong> {', '.join(r['feedback']['missing_keywords'])}<br>
#             <strong>Suggestion:</strong> {r['feedback']['suggestion']}
#         </div>
#     """, unsafe_allow_html=True)