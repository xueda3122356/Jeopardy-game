import os
from flask import Flask, render_template
import random

app = Flask(__name__)

@app.route('/categories')
def get_categories():
    dot = '.'
    end = []
    category_dir = 'code/static/categories'
    categories = os.listdir(category_dir)
    useCategoryIds = random.sample(categories, 6)
    for i in useCategoryIds:
      end.append(i.split(dot, 1)[0])
    print(end)
    return end
@app.route('/')
def index():
    dot = '.'
    end = []
    category_dir = 'code/static/categories'
    categories = os.listdir(category_dir)
    useCategoryIds = random.sample(categories, 6)
    for i in useCategoryIds:
      end.append(i.split(dot, 1)[0])
    print(end)

    return render_template('index.html', cat=None)

if __name__ == '__main__':
    app.run(debug=True)
    app.use_static(__name__, static_folder='code')

