import sourcetypes

template_str: sourcetypes.python = """
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
import matplotlib.pyplot as plt

# Convert data to a DataFrame
df = pd.DataFrame(data)

# Extract the x values and convert them to numeric
X = df[['{{ command['x_fieldname'] }}']].astype(float)

# Prepare the figure for plotting
fig, ax = plt.subplots(figsize=(10, 6))

# Iterate over the y field names to perform linear regression and plot each one
for index, y_fieldname in enumerate({{ command['y_fieldnames'] }}):
    y = df[y_fieldname].astype(float)
    
    # Perform linear regression
    model = LinearRegression()
    model.fit(X, y)
    trend = model.predict(X)
    
    # Extract plotting styles
    style = {{ command['styles'] }}[index]
    color = style['color']
    linewidth = style.get('linewidth', 2)  # Default linewidth if not specified
    
    # Plot actual data
    ax.scatter(X, y, color=color, alpha=0.5, label=f'{y_fieldname} Actual')
    
    # Plot regression line
    ax.plot(X, trend, color=color, linewidth=linewidth, label=f'{y_fieldname} Trend')

# Enhancements for the plot
ax.set_xlabel('{{ command['x_fieldname'] }}')
ax.set_ylabel('Values')
ax.legend()
"""
