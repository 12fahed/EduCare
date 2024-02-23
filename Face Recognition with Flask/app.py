import os
import cv2
import numpy as np
from PIL import Image
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route("/")
def hello_world():
    return render_template("./index.html")

@app.route("/edit", methods=["GET", "POST"])
def edit():
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
        path='./dataset'

        recognizer = cv2.face.LBPHFaceRecognizer.create()

        detector=cv2.CascadeClassifier("haarcascade_frontalface_default.xml")

        #function to get the images and label data
        def getImagesAndLabels(path):
            imagePaths=[os.path.join(path, f) for f in os.listdir(path)] #to specify image path using os 
            faceSamples=[]
            ids=[]

            for imagePath in imagePaths: #for every imagePath in imagePaths
                PIL_img=Image.open(imagePath).convert('L') #convert it to grayscale L-Luminiscence
                img_numpy=np.array(PIL_img, 'uint8') #converts grayscale PIL image into numpy array
                #uint8 means unsigned integer of 8-bits and stores it in numpy array 

                #split path and file name, and further split and take the 2nd element of it
                id=int(os.path.split(imagePath)[-1].split(".")[1]) #naming conventions
                faces=detector.detectMultiScale(img_numpy) 

                for(x,y,w,h) in faces:
                    faceSamples.append(img_numpy[y:y+h,x:x+w]) #selects only ROI
                    ids.append(id)

            return faceSamples, ids

        print ("\n\tTraining faces. It will take a few seconds. Please wait ...")
        faces, ids = getImagesAndLabels(path) #respective images and user ID
        recognizer.train(faces, np.array(ids)) #trains model with corresponding faces and numpy array of ids

        #save the model into trainer/trainer.yml
        recognizer.write('./trainer.yml') 

        #print the numer of faces trained and end program
        print("\n\t{0} faces trained.".format(len(np.unique(ids))))

        
    return render_template("./index.html") #return "SUCCESS"

app.run(debug=True)