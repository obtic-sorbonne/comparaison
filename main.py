
# libraries
from flask import Flask, request, jsonify, render_template
from flask import make_response
from flask_cors import CORS

from code_folder.code import call
from code_folder.code import get_indices
from code_folder.code import replace_sentences_html

app = Flask(__name__)
CORS(app)

# redirects to main page HTML
@app.route('/')
def index():
    return render_template('index.html')

# function to execute python code with what is sent from script.js
@app.route('/process', methods=['GET', 'POST'])
def compare_texts():
    data = request.json
    text1Text = data['text1Text']
    text2Text = data['text2Text']
    text1HTML = data['text1HTML']
    text2HTML = data['text2HTML']
    method = data['method']
    submethods = data['submethods']
    slidingValue = data['slidingValue']
    embedding_model = data['embedding'] 
    top_quantile =float(data['sliderConfidence'])
    # precision label indicates if we use quantile or similarity score for precision selection
    precision_label = data['precisionLabel']
    
    df_comp = call(text1Text, text2Text, method, slidingValue, submethods, embedding_model, top_quantile, precision_label)
    _, _, _, sent_list_1, sent_list_2 = get_indices(df_comp, text1HTML, text2HTML)

    # colors for highlighting
    colors_list = [
    'blue',
    'teal',
    'maroon',
    'indigo',
    'olive',
    'sienna',
    'orange',
    'sage',
    'cerulean',
    'plum',
    'coral',
    'slate'
]
    #class_text_1 =  get_indices_highlighted(text1Text, text2Text, highlight_ranges_text1, highlight_ranges_text2)
    text_1, text_2 = replace_sentences_html(text1Text, text2Text,
                                            sent_list_1, sent_list_2,
                                            colors_list)

    return jsonify({'text_1': text_1,
                    'text_2': text_2})

if __name__ == '__main__':  
    app.run(debug=True)

