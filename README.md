
```markdown
# 🏙️ NYC Airbnb Room Type Classification

A machine learning project that predicts the **room type of an Airbnb listing in New York City** based on listing characteristics such as location, price, availability, minimum nights, and review activity.

The project covers the full machine learning workflow, from exploratory data analysis and preprocessing to model training, evaluation, API development, and an interactive web interface.

## 🎯 Project Objective

The goal of this project is to classify an Airbnb listing into one of the following room types:

- Entire home/apt
- Private room
- Shared room

The model uses information such as borough, neighbourhood, latitude, longitude, price, minimum nights, number of reviews, reviews per month, host listing count, and yearly availability.

## 📊 Dataset

The project uses the **New York City Airbnb Open Data** dataset available on Kaggle.

Dataset source:  
https://www.kaggle.com/datasets/dgomonov/new-york-city-airbnb-open-data

The dataset is downloaded using `kagglehub`.

## 🔍 Exploratory Data Analysis

The notebook performs exploratory data analysis to understand the structure, quality, and patterns of the dataset.

The analysis includes:

- Dataset shape and columns
- Data types
- Summary statistics
- Missing values
- Duplicate inspection
- Target class distribution
- Univariate analysis
- Bivariate analysis
- Numerical feature distributions
- Categorical feature distributions
- Boxplots
- Outlier inspection
- Correlation analysis
- Geographic distribution using latitude and longitude

The target variable is imbalanced, with some room types appearing much more frequently than others.

## 🧹 Data Cleaning & Feature Engineering

Several preprocessing steps are applied before model training.

Columns that mainly act as identifiers or free text are removed:

- `id`
- `name`
- `host_id`
- `host_name`
- `last_review`

Missing values in `reviews_per_month` are replaced with `0`, representing listings with no review activity yet.

Extreme values in `price` and `minimum_nights` are treated using **99th percentile clipping**. Instead of deleting full observations, extremely large values are capped to reduce their influence on the model.

## ⚙️ Preprocessing Pipeline

The project uses Scikit-learn's `Pipeline` and `ColumnTransformer` to automate preprocessing.

Numerical features are processed using:

- Missing value imputation
- Standard scaling

Categorical features are processed using:

- Missing value imputation
- One-hot encoding

The categorical encoder uses:

```python
OneHotEncoder(handle_unknown="ignore")
```

This allows the model to safely handle categories that were not present during training.

## 🤖 Machine Learning Models

Several classification models are explored and compared:

- Logistic Regression
- Decision Tree Classifier
- Random Forest Classifier
- Gradient Boosting Classifier

Because the target classes are imbalanced, compatible models can use:

```python
class_weight="balanced"
```

to give more importance to minority classes.

## 📈 Model Evaluation

The models are evaluated using classification metrics such as:

- Accuracy
- Precision
- Recall
- F1 Score
- Macro F1 Score
- Confusion Matrix

Macro F1 Score is particularly useful because it gives equal importance to each class instead of allowing the largest class to dominate the evaluation.

Cross-validation is also used to compare model performance across different subsets of the training data.

## 🔧 Hyperparameter Tuning

The selected model is optimized using:

```python
RandomizedSearchCV
```

The tuning process explores different model configurations to improve classification performance.

For Random Forest, tuned parameters may include:

- Number of estimators
- Maximum tree depth
- Minimum samples required to split
- Minimum samples required in a leaf

## 💾 Model Pipeline

The complete preprocessing and machine learning workflow is saved as:

```text
Model_Pipeline.pkl
```

Saving the full pipeline ensures that the exact same preprocessing steps used during training are also applied during prediction.

The model file is generated locally and is not included in the GitHub repository because it exceeds GitHub's standard file-size limit.

## 🌐 FastAPI Backend

The trained model is served through a **FastAPI API**.

The API loads the saved model pipeline using:

```python
model = joblib.load("Model_Pipeline.pkl")
```

Incoming data is validated using Pydantic before being sent to the model.

The expected input features are:

- `latitude`
- `longitude`
- `price`
- `minimum_nights`
- `number_of_reviews`
- `reviews_per_month`
- `calculated_host_listings_count`
- `availability_365`
- `neighbourhood_group`
- `neighbourhood`

The main prediction endpoint is:

```text
POST /predict
```

Example request:

```json
{
  "latitude": 40.73,
  "longitude": -73.98,
  "price": 150,
  "minimum_nights": 3,
  "number_of_reviews": 25,
  "reviews_per_month": 1.2,
  "calculated_host_listings_count": 1,
  "availability_365": 180,
  "neighbourhood_group": "Manhattan",
  "neighbourhood": "Chelsea"
}
```

Example response:

```json
{
  "Predicted_room_type": "Entire home/apt",
  "Probability": [
    0.82,
    0.16,
    0.02
  ]
}
```

## 🖥️ Web Interface

The project includes an interactive frontend built with:

- HTML
- CSS
- JavaScript

Users can describe an Airbnb listing by entering:

- Borough
- Neighbourhood
- Latitude
- Longitude
- Price per night
- Minimum nights
- Days available per year
- Total number of reviews
- Reviews per month
- Number of host listings

The browser sends this information to the FastAPI `/predict` endpoint.

The interface then displays:

- Predicted room type
- Prediction confidence
- Probability for each room-type class

The frontend communicates with the API running locally at:

```text
http://127.0.0.1:8000
```

## 🏗️ Project Structure

```text
NYC-Airbnb-Room-Type-Classification/
│
├── nyc_airbnb_room_type_classification.ipynb
├── main.py
├── index.html
├── script.js
├── style.css
├── requirements.txt
├── .gitignore
└── README.md
```

The trained model is generated locally:

```text
Model_Pipeline.pkl
```

and is excluded from Git tracking.

## 🧠 Workflow

```text
Raw Airbnb Dataset
        ↓
Data Inspection
        ↓
Exploratory Data Analysis
        ↓
Missing Value Analysis
        ↓
Outlier Analysis
        ↓
Data Cleaning
        ↓
Feature / Target Separation
        ↓
Train-Test Split
        ↓
Numerical Preprocessing
        ↓
Categorical Preprocessing
        ↓
ColumnTransformer
        ↓
Machine Learning Pipeline
        ↓
Model Comparison
        ↓
Cross-Validation
        ↓
Hyperparameter Tuning
        ↓
Final Evaluation
        ↓
Save Model Pipeline
        ↓
FastAPI Backend
        ↓
Interactive Web Interface
```

## 🛠️ Technologies Used

### Data Analysis
- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn

### Machine Learning
- Scikit-learn
- Logistic Regression
- Decision Tree
- Random Forest
- Gradient Boosting
- Pipeline
- ColumnTransformer
- OneHotEncoder
- StandardScaler
- RandomizedSearchCV

### Backend
- FastAPI
- Pydantic
- Joblib
- Uvicorn

### Frontend
- HTML
- CSS
- JavaScript

### Dataset
- Kaggle
- KaggleHub

## 📌 Key Concepts Demonstrated

- Exploratory Data Analysis
- Univariate analysis
- Bivariate analysis
- Correlation analysis
- Geographic data visualization
- Missing value treatment
- Outlier detection
- Outlier clipping
- Numerical preprocessing
- Categorical encoding
- Handling unknown categories
- Classification
- Class imbalance handling
- Cross-validation
- Hyperparameter tuning
- Machine learning pipelines
- Model persistence
- REST API development
- Pydantic input validation
- Frontend and backend integration

## 🚀 Running the Project Locally

Clone the repository:

```bash
git clone https://github.com/eyaoueslati06/NYC-Airbnb-Room-Type-Classification.git
```

Move into the project folder:

```bash
cd NYC-Airbnb-Room-Type-Classification
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Run the Jupyter notebook:

```text
nyc_airbnb_room_type_classification.ipynb
```

The notebook performs the analysis, trains the model, and generates:

```text
Model_Pipeline.pkl
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The API will run at:

```text
http://127.0.0.1:8000
```

FastAPI interactive documentation is available at:

```text
http://127.0.0.1:8000/docs
```

Finally, open:

```text
index.html
```

in your browser while the FastAPI server is running.

Enter the characteristics of an Airbnb listing and click **Predict room type** to receive the predicted class and probabilities.
```
