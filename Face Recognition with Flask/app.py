from flask import flash
import io
import os
from datetime import datetime
import cv2
import numpy as np
from PIL import Image
from flask import Flask, render_template, request
from flask_pymongo import PyMongo
import gridfs

app = Flask(__name__)
app.secret_key = "secret_key"
app.config["MONGO_URI"] = "mongodb+srv://fahed:fahed12@admin.gd1pah0.mongodb.net/HTA"
db = PyMongo(app).db
fs = gridfs.GridFS(db)

@app.route("/")
def home():
    return render_template("./index.html")

@app.route("/collect", methods=["GET", "POST"])
def collect():
    if request.method == "POST":
        camera=cv2.VideoCapture(0) #to capture video through camera using openCV
        #set() gives width and height in terms of pixels
        camera.set(3, 640) #for width(3)
        camera.set(4, 480) #for height(4)

        #has complex classifiers like AdaBoost which allows negative input(non-face) to be quickly discarded while spending more computation on promising or positive face-like regions.
        face=cv2.CascadeClassifier("./haarcascade_frontalface_default.xml") #to detect the face
        # face= cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        face_id=request.form.get("face_id") #in order to get recognised later
        print("Capturing face....")

        i=0 #keeps a count of the number of images

        while(True): #to get images for dataset
            ret, img=camera.read() #to capture images using the camera
    
            #grayscale compresses an image to its barest minimum pixel, thereby making it easy for visualization
            gray=cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) #converting image to gray color
    
            #if a rectangle is found, it returns Rect(x, y, w, h)
            faces=face.detectMultiScale(gray, 1.3, 5) #multiscale detection of gray image with dimensions    

            for(a, b, c, d) in faces: #to store images in dataset
                #to draw the rectangle in the original image that we found out in the frame with parameters as the image, start of (x, y) then the width and height as (x+w, y+h) and finally the color in RGB
                cv2.rectangle(img, (a, b), (a+c, b+d), (255, 0, 0))
                i+=1
        
                #writing into the dataset, first the name of the images in dataset and then the image
                cv2.imwrite("./dataset/User."+ str(face_id) +"."+ str(i) +".jpg", gray[b:b+d, a:a+c])
        
                #to display the image that is scanned 
                cv2.imshow("image", img)
                
                img_array = gray[b:b+d, a:a+c]  # Extract the face region
                # Convert the numpy array to binary
                
                _, img_encoded = cv2.imencode('.jpg', img_array)
                # Insert binary data into MongoDB
                
                fs.put(img_encoded.tobytes(), filename=f"User.{face_id}.{i}.jpg")

            #takes in miliseconds after which it will close, if argument is 0, then it will run until a key is pressed
            x=cv2.waitKey(1) & 0xff
            #if x==20:
                #break
            if i>=150:
                break

        print("\nExiting Program")
        camera.release()
        cv2.destroyAllWindows()
        
        # Training it simultaneously
        
        #path for face image database
        # path='./dataset'

        recognizer = cv2.face.LBPHFaceRecognizer.create()

        detector=cv2.CascadeClassifier("haarcascade_frontalface_default.xml")

        #function to get the images and label data
        def getImagesAndLabels():
            # imagePaths=[os.path.join(path, f) for f in os.listdir(path)] #to specify image path using os 
            faceSamples=[]
            ids=[]
            
        # Get the images from MongoDB
            for grid_out in fs.find({}):
                img_bytes = grid_out.read()
                nparr = np.frombuffer(img_bytes, np.uint8)
                img_np = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)

                # Extract the ID from the filename
                id = int(grid_out.filename.split(".")[1])

                faces = detector.detectMultiScale(img_np)

                for (x, y, w, h) in faces:
                    faceSamples.append(img_np[y:y+h, x:x+w])
                    ids.append(id)

            return faceSamples, ids

            # for imagePath in imagePaths: #for every imagePath in imagePaths
            #     PIL_img=Image.open(imagePath).convert('L') #convert it to grayscale L-Luminiscence
            #     img_numpy=np.array(PIL_img, 'uint8') #converts grayscale PIL image into numpy array
            #     #uint8 means unsigned integer of 8-bits and stores it in numpy array 

            #     #split path and file name, and further split and take the 2nd element of it
            #     id=int(os.path.split(imagePath)[-1].split(".")[1]) #naming conventions
            #     faces=detector.detectMultiScale(img_numpy) 

            #     for(x,y,w,h) in faces:
            #         faceSamples.append(img_numpy[y:y+h,x:x+w]) #selects only ROI
            #         ids.append(id)

            # return faceSamples, ids

        print ("\n\tTraining faces. It will take a few seconds. Please wait ...")
        faces, ids = getImagesAndLabels() #respective images and user ID
        recognizer.train(faces, np.array(ids)) #trains model with corresponding faces and numpy array of ids

        #save the model into trainer/trainer.yml
        recognizer.write('./trainer.yml') 

        #print the numer of faces trained and end program
        print("\n\t{0} faces trained.".format(len(np.unique(ids))))
        
        attendance_data = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "time": datetime.now().strftime("%H:%M:%S"),
            "face_id": int(face_id),
            "attend": {"p": 0, "c": 0, "m": 0, "b": 0} 
        }
        db.attendance.insert_one(attendance_data)

        
    return render_template("./recognize.html") #return "SUCCESS"

@app.route("/recognize", methods=["GET", "POST"])
def recognize():
    if request.method=="POST":
        recognizer=cv2.face.LBPHFaceRecognizer.create()
        recognizer.read('./trainer.yml')
        cascadePath="./haarcascade_frontalface_default.xml"
        faceCascade=cv2.CascadeClassifier(cascadePath)

        font=cv2.FONT_HERSHEY_TRIPLEX

        #initiate id counter
        id=0

        names=[j for j in range(181)] 
        #names["Chinmay"]

        #initialize and start realtime video capture
        cam=cv2.VideoCapture(0)
        cam.set(3, 640) #set video width
        cam.set(4, 480) #set video height

        #define min window size to be recognized as a face of minimum width and height
        minW = 0.1*cam.get(3)
        minH = 0.1*cam.get(4)
        
        marked=False
        i=0
        while True:

            ret, img=cam.read()
        
            gray=cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) #converting image to gray color

            faces=faceCascade.detectMultiScale(  #detect faces using haar classifier and storing it
                gray,
                scaleFactor=1.2,
                minNeighbors=5,
                minSize=(int(minW), int(minH)), #minimum width and minimum height
                )

            for(x,y,w,h) in faces: #making 4 different edges

                #image, top-left, bottom-right, BGR, thickness
                cv2.rectangle(img, (x,y), (x+w,y+h), (0,255,0), 2) 
                i+=1
                
                #Region Of Interest - height, width
                id, confidence=recognizer.predict(gray[y:y+h,x:x+w]) 

                #check if confidence is less them 100 ==> "0" is perfect match 
                if (confidence < 70): #if the picture is recognised             
                    id = names[id]
                    confidence = "  {0}%".format(round(100 - confidence))
                    
                    document=db.attendance.find_one({"face_id": id})
                    phy=document.get("attend").get("p")
                    chem=document.get("attend").get("c")
                    math=document.get("attend").get("m")
                    bio=document.get("attend").get("b")
                    
                    if request.form['subject']=="physics":
                        phy=phy+1
                        
                    elif request.form['subject']=="chemistry":
                        chem=chem+1
                        
                    elif request.form['subject']=="maths":
                        math=math+1
                        
                    elif request.form['subject']=="biology":
                        bio=bio+1
                        
                    db.attendance.update_one({"face_id": id}, {"$set": {"attend.p": phy, "attend.c": chem, "attend.m": math, "attend.b": bio}})
                    flash("Attendance marked successfully!", "success")
                    marked=True
                    break
                    
                else: #if the picture is not recognised
                    id = "unknown" 
                    confidence = "  {0}%".format(round(100 - confidence))
                
                #image, string, positioning, font, font scale factor(set to default), thickness
                cv2.putText(img, str(id), (x+5,y-5), font, 1, (255,255,255), 2)
                cv2.putText(img, str(confidence), (x+5,y+h-5), font, 1, (255,255,0), 1)  
                
            if marked==True:
                print("\n\tExiting Program")
                cam.release()
                cv2.destroyAllWindows()
                return render_template("./recognize.html")
            
            cv2.imshow('camera', img) #showing the camera

            k=cv2.waitKey(16) & 0xff #To extract the ASCII value of the pressed key
            if k==97: #ASCII value of 'a' from the keyboard
                break 
            elif i>=150:
                break 
            
        #do a bit of cleanup
        print("\n\tExiting Program")
        cam.release()
        cv2.destroyAllWindows()
    
    
    return render_template("./recognize.html")

app.run(debug=True)