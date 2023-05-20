# import required packages 
import requests
import json
import unidecode

# API to retrieve wine information 
url = "https://api.sampleapis.com/wines/reds"

# tell the server to return JSON response data
headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
}

# GET response data from api url
response = requests.request("GET", url, headers=headers, data={})

# deserialize data into JSON-formatted data
jsondata = response.json()

# initialize data structure of dictionary, which will become a json file
wine_data = {
    "name": "reds",
    "children": []
}

# go through each item in the GET response list and clean up the data
for x in jsondata:
    location = [x['location']]
    if (len(location[0].split('\n'))) == 1:
        country = "unknown-country"
        town = "unknown-city"
    else:
        location = (location[0].split('\n'))
        town_name = location[2]
        town = unidecode.unidecode(town_name)
        country = location[0]

    winery = [x['winery']]
    wine = [x['wine']]
    winery_name = unidecode.unidecode(winery[0])
    wine_name = unidecode.unidecode(wine[0])

    # fill in the information manually for the few outliners where (len(location[0].split('\n'))) == 1:)
    if winery_name == "Tres Mil Botellas":
        town = "Cadiz"
        country = "Spain"
    if wine_name == "Onda Napa Valley Cabernet Sauvignon 2010":
        winery_name = "Dana Estates"
        town = "Napa Valley"
        country = "United States"
    if wine_name == "Tesseron Cognac Lot No 29 X.O Exception N.V.":
        winery_name = "Tesseron"
        country= "France"
        town = "Cognac"
    if wine_name == "Chateau D Yguene 2001":
            wine_name = "Chateau D'Yguene 2001"
            winery_name = "Sauternes"
            town = "Sauternes"
            country = "France"

    # hierarchical data structure to represent api response data in a hierarchy of countries, towns, wineries and the count of wines produced by each winery. 

    # search for an existing country node in the wine_data["children"]. If there is a match, move to the next node. If there is no match, create node for that country and append the lower level data. 
    country_node = next((child for child in wine_data["children"] if child["name"] == country), None)
    if country_node:
        # if country is found, search for an existing town node in country_node["children"]. If there is a match, move to the next node. If not, create a node for that town and append the lower level data. 
        town_node = next((child for child in country_node["children"] if child["name"] == town), None)
        if town_node:
            # if town is found, search for an existing winery in town_node["children"]. If there is a match, increment its value by one. This value represents the the number of world class wines from a single winery. If there is no match, set the value of that winery to 1.  
            winery_node = next((child for child in town_node["children"] if child["name"] == winery_name), None)
            if winery_node:
                winery_node["value"] += 1
            else:
                town_node["children"].append({
                "name": winery_name,
                "value": 1
            })
        else:
            country_node["children"].append({
                "name": town,
                "children": [{
                    "name": winery_name,
                    "value": 1
                }]
            })

    else:
        wine_data["children"].append({
            "name": country,
            "children": [{
                "name": town,
                "children": [{
                    "name": winery_name,
                    "value": 1
                }]
            }]
        })

# open() is used to open a file. It takes three arguments, the file name, the mode in which the file should be opened (w = writing), and the encoding of the file (UTF8). A file object that represents the opened file is returned and assigned to the variable 'f'
with open('red_wine.json', 'w', encoding='UTF8') as f:
    # call json.dump() to write the wine_data dictionary to the opened 'f' file. This function takes two arguments - the data to be serialized (wine_data) and the file object (f).
    json.dump(wine_data, f)

# a helpful message to indicate the process is complete
print("done")