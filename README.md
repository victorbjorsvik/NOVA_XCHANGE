# Instructions for first time users:

1. open the code in a virtual environmnet - Github.dev works well
2. Navigate into the finance directory
```
   cd finance
```
4. Install the required packages
```
   pip install -r requirements.txt
```
6. make sure you are in the directory containing the app.py file
7. run command "flask run" or "python -m flask run" in terminal. You will get a link where you can check out the website
```
flask run
```
or
```
python -m flask run
```


## Instructions for interction with database

1. Make sure you have 'finance.db' in your pwd
2. In terminal:
```
sqlite3 finance.db
```
the cursor should change from a '$' to 'sqlite'
3. To see all the availible tables:
```
.schema
```
4. From here you can use regular SQL-queries e.g.
```
SELECT * FROM holdings;
```



# NOVA SBE CRYPTO EXCHANGE

59279 Justin Bruce Sams

58165 Victor Bjorsvik

60161 Tim Gunkel

59892 Moritz Deuchler
