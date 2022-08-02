import sys
import json

#!/usr/bin/env python
# coding: utf-8

curr_file = 'datas/' + sys.argv[1]
product_name = sys.argv[2].lower()
new_price = sys.argv[3]
new_date = sys.argv[4]
new_loc = sys.argv[5].lower()
new_quantity = sys.argv[6]

# In[257]:


import pandas as pd
import warnings
warnings.filterwarnings('ignore')


# In[258]:


df = pd.read_csv(curr_file)

# Checking if the all columns exist
if not 'Product' in df or not 'Order_Date' in df or not 'Location' in df or not 'Quantity' in df or not 'Price' in df or not 'Sale' in df:
    output = {
        "success": False,
        "message": 'Please check all names of columns are correct and present'
    }

    print(json.dumps(output))
    exit()

# # Data pre-processing

# In[259]:

df['Product'] = df['Product'].str.lower()

# Return error message if product does not exist
if not product_name in df['Product'].unique():
    output = {
        "success": False,
        "message": product_name + ' is not part of your products'
    }

    print(json.dumps(output))
    exit()
    

# filter products
df = df.loc[df['Product'] == product_name]

# drop product & category column
df = df.drop(['Product', 'Category'], axis=1)


# In[260]:


# Encoding location to numerical
from sklearn.preprocessing import LabelEncoder

le = LabelEncoder()

df['Location'] = df['Location'].str.lower()


# Return error message if product does not exist
if not new_loc in df['Location'].unique():
    output = {
        "success": False,
        "message": new_loc + ' is not part of your locations'
    }

    print(json.dumps(output))
    exit()

df['Location'] = le.fit_transform(df['Location'])


# ## Handling missing values

# In[261]:


# fill missing value

# Quantity_Ordered to mean
df['Sale'] = df['Sale'].fillna(df['Sale'].mean())

# Price_Each to mean
df['Price'] = df['Price'].fillna(df['Price'].mean())

# Order_Date to previous date/row
df['Order_Date'] = df['Order_Date'].fillna(df['Order_Date'].bfill())


# In[262]:


# formatting date
df['Order_Date'] = pd.to_datetime(df['Order_Date'], format='%Y-%m-%d', infer_datetime_format=True)

df['Order_Date'].head()


# In[263]:


# sorting by date
df = df.sort_values(by='Order_Date', ascending=True)

# In[264]:

# converting date to number of days since epoch
df['Order_Date'] = (df['Order_Date'] - pd.to_datetime('1970-01-01'))

# converting days to int
df['Order_Date'] = df['Order_Date'].dt.days.astype('int16')


# In[265]:


#Extracting vars for splitting

# dependent vars
Y = df['Sale']

df = df.drop(['Sale'], axis=1)

# independent vars
X = df

# In[268]:


# ML related modules
from sklearn.tree import DecisionTreeRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error


# In[269]:


# Splitting data for training and test
x_train, x_test, y_train, y_test = train_test_split(X, Y, test_size = 0.2, random_state=42)


# # Gradient Boosting for Regressor

# In[270]:


# custom gradient boost
class GradientBoost:
    
    def __init__(self, learning_rate=0.1, n_estimators=200, max_depth=3,min_samples_split=20):
        self.learning_rate = learning_rate
        self.n_estimators = n_estimators
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.trees = []
  
    def fit(self, X, y):
        
        # constant value - mean of sale
        self.F0 = y.mean()
        Fm = self.F0
        
        for _ in range(self.n_estimators):
            # residual/error with respect to the previous prediction
            r = y - Fm
            
            # train regression tree
            tree = DecisionTreeRegressor(max_depth=self.max_depth, random_state=0, min_samples_split=self.min_samples_split)
            tree.fit(X, r)
            
            # predict new value of current iteration
            gamma = tree.predict(X)
            
            # compute and update new residual
            Fm += self.learning_rate * gamma
            
            # store trained tree 
            self.trees.append(tree)
            
    def predict(self, X):
        
        Fm = self.F0
        
        for i in range(self.n_estimators):
            Fm += self.learning_rate * self.trees[i].predict(X)
            
        return Fm


# In[271]:


# gradient boost with default hyper params
custom_gbm = GradientBoost(n_estimators=500, learning_rate=0.1, max_depth=3, min_samples_split=15)


# ## Fitting the dataset

# In[272]:


custom_gbm.fit(x_train, y_train)


# In[274]:


train_rmse = mean_squared_error(y_train, 
custom_gbm.predict(x_train), squared=False)

error = round(train_rmse, 3)
# # Predict sale from new data

# In[275]:


# parsing date for prediction

# formatting date
conv_date = pd.to_datetime(new_date, format='%Y-%m-%d')

# converting date to number of days since epoch
new_date = (conv_date - pd.to_datetime('1970-01-01')).days

new_date


# In[276]:

# Using new data to predict sale
prediction = custom_gbm.predict([[new_date, le.transform([new_loc]), new_quantity, new_price]])

output = {
    "success": True,
    "data": prediction[0],
    "error": error
}

print(json.dumps(output))
