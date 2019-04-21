import json

from flask import Flask, render_template
# import pandas as pd
from flask import jsonify

# from scipy.cluster.hierarchy import dendrogram, linkage
# import matplotlib.pyplot as plt


app = Flask(__name__)

@app.route("/")
def index():
    df = pd.read_csv('data/sample_data/sample_time_series_data.csv').drop('Open', axis=1)
    chart_data = df.to_dict(orient='records')
    chart_data = json.dumps(chart_data, indent=2)
    data = {'chart_data': chart_data}



    return render_template("index.html", data=data)

@app.route("/index_v1")
def index_v1():
    df = pd.read_csv('data/sample_data/sample_time_series_data.csv').drop('Open', axis=1)
    chart_data = df.to_dict(orient='records')
    chart_data = json.dumps(chart_data, indent=2)
    data = {'chart_data': chart_data}



    return render_template("index_v1.html", data=data)


tasks = [
    {
        'id': 1,
        'title': u'Buy groceries',
        'description': u'Milk, Cheese, Pizza, Fruit, Tylenol', 
        'done': False
    },
    {
        'id': 2,
        'title': u'Learn Python',
        'description': u'Need to find a good Python tutorial on the web', 
        'done': False
    }
]

fnames_astronomy = []

fnames_atp = []
from os import listdir
from os.path import isfile, join

ts_astronomy_directory = 'static/resources/data/ts_astronomy_lightcurves_processed/'
ts_atp_directory = 'static/resources/data/ts_atp_processed/'

fnames_astronomy = [f for f in listdir(ts_astronomy_directory) if isfile(join(ts_astronomy_directory, f))]
fnames_atp = [f for f in listdir(ts_atp_directory) if isfile(join(ts_atp_directory, f))]

@app.route('/get_ts_fnames', methods=['GET'])
def get_ts_fnames():
	return jsonify({'fnames_astronomy': fnames_astronomy, 'fnames_atp': fnames_atp})

@app.route('/get_clusters', methods=['GET'])
def get_clusters():





		# Import raw data
	# def import_data():
	raw_data_df = pd.read_csv("data/sample_data/Power-Networks-LCL-June2015(withAcornGps)v2_1.csv", header=0) # creates a Pandas data frame for input value
	#     return raw_data_df


	raw_data_df['date']=pd.to_datetime(raw_data_df['DateTime'])
	raw_data_df['dy']=raw_data_df['date'].dt.dayofyear
	raw_data_df['heure']=raw_data_df['date'].dt.time
	data_2014=raw_data_df.loc[:, ['heure','dy','KWH/hh (per half hour) ']]
	temp=raw_data_df.loc[:, ['dy','KWH/hh (per half hour) ']]
	data_2014['KWH/hh (per half hour) ']=pd.to_numeric(data_2014['KWH/hh (per half hour) '],errors='coerce')
	temp=temp.set_index(data_2014.heure)
	temp=data_2014.pivot_table(index=['heure'],columns=['dy'] ,values=['KWH/hh (per half hour) '],fill_value=0)

	# print(temp.head())

	# temp.plot(figsize=(12, 12))

	# plt.savefig('output.png')

	Z = linkage(temp.iloc[:,0:365], 'ward')

	plt.figure(figsize=(25, 10))
	plt.title('Hierarchical Clustering Dendrogram')
	plt.xlabel('sample index')
	plt.ylabel('distance')
	dendrogram(
	    Z,
	    leaf_rotation=90.,  # rotates the x axis labels
	    leaf_font_size=8.,  # font size for the x axis labels
	)
	plt.savefig('static/sample_output1.png')


	plt.title('Hierarchical Clustering Dendrogram (truncated)')
	plt.xlabel('sample index')
	plt.ylabel('distance')
	dendrogram(
	    Z,
	    truncate_mode='lastp',  # show only the last p merged clusters
	    p=12,  # show only the last p merged clusters
	    show_leaf_counts=False,  # otherwise numbers in brackets are counts
	    leaf_rotation=90.,
	    leaf_font_size=12.,
	    show_contracted=True,  # to get a distribution impression in truncated branches
	)
	plt.savefig('static/sample_output2.png')





	return jsonify({'tasks': tasks})







if __name__ == "__main__":
    app.run(debug=True)
