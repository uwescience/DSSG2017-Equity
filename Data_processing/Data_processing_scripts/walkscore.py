import urllib
import pandas

api_key = "67548301336ab2b787f79ed999aa2c40"
centroids = pandas.read_csv("BG_centroids.csv")
centroids['walkscore'] = 0
centroids['bikescore'] = 0
centroids['transitscore'] = 0

def get_content(api_key, lat, lon):
    connection = urllib.urlopen("http://api.walkscore.com/score?format=json&lat="+lat+"&lon="+lon+"&transit=1&bike=1&wsapikey="+api_key)
    output = connection.read()
    connection.close()

    print(output)
    walkscore = output[output.find("walkscore")+12:output.find("walkscore")+14]
    bikescore = output[output.find("bike")+18:output.find("bike")+20]
    transitscore = output[output.find("transit")+21:output.find("transit")+23]
    print transitscore
    return(walkscore,bikescore,transitscore)


for ind, row in centroids.iloc[478:].iterrows():
    lat = str(row["lat"])
    lon = str(row["long"])
    (walkscore,bikescore,transitscore) = get_content(api_key, lat, lon)
    centroids.set_value(ind, 'walkscore', walkscore)
    centroids.set_value(ind, 'bikescore', bikescore)
    centroids.set_value(ind, 'transitscore', transitscore)
    #centroids.to_csv('BG_transitscore2.csv')	