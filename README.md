
# GEN V- HealthierWE

## Table of Contents

- [Project Summary](#project-summary)
  - [The issue we are hoping to solve](#the-issue-we-are-hoping-to-solve)
  - [How our technology solution can help](#how-our-technology-solution-can-help)
  - [Our idea](#our-idea)
  - [Our solution](#our-solution)
  
- [Technology Implementation](#technology-implementation)
  - [IBM watsonx product(s) used](#ibm-watsonx-products-used)
  - [Other IBM technology used](#other-ibm-technology-used)
  
- [Solution Architecture](#solution-architecture)

- [Presentation Materials](#presentation-materials)
  - [Solution demo video](#solution-demo-video)
  - [Project development roadmap](#project-development-roadmap)
  
- [Additional Details](#additional-details)
  - [How to run the project](#how-to-run-the-project)
  - [Live demo](#live-demo)

- [Developers](#developers)

- [License](#license)

## Project Summary

### The issue we are hoping to solve

The issue we aim to solve is the limited access to accurate nutritional information in low-income and marginalized communities, where healthy food options are often scarce. Our AI-powered app provides these communities with real-time nutritional insights and personalized recommendations, enabling them to make informed food choices and improve their health, regardless of their financial or geographic constraints.

### How our technology solution can help

Our app uses AI to provide personalized, real-time nutritional insights and recommendations.

### Our idea

**CalorieTracker -** **AI-Powered Nutritional Insights and Personalized Recommendations**

**CalorieTracker** is a cutting-edge application designed to empower users to take control of their health and nutrition in an intuitive and user-friendly manner. By leveraging advanced AI-based image recognition technology, combined with comprehensive nutritional analysis, CalorieTracker helps users monitor and optimize their diet by providing detailed insights into the nutritional content of their meals. The application also delivers personalized recommendations based on the user’s dietary goals and health status, ensuring that users not only track their calories but also improve their overall well-being.

Our Solution

CalorieTracker is designed to address these issues by combining AI-based image recognition with a comprehensive nutritional database. Users can either upload a photo of their meal or manually enter food items to receive a detailed breakdown of their caloric intake, macronutrient composition (carbs, proteins, fats), and other essential nutritional values (such as vitamins, minerals, fiber, and sugars). Additionally, the application offers personalized recommendations based on the user’s specific health goals, medical conditions, and preferences.
More detail is available in our [description document](./DESCRIPTION.md).

## Technology implementation

### IBM watsonx product(s) used

**Featured watsonx products**

- [watsonx.ai](https://www.ibm.com/products/watsonx-ai) - WHERE AND HOW THIS IS USED IN OUR SOLUTION

### Other IBM technology used

**Additional IBM AI services (Remove any that you did not use)**

- [Watson Machine Learning](https://cloud.ibm.com/catalog/services/watson-machine-learning) - WHERE AND HOW THIS IS USED IN OUR SOLUTION

- [Watson Studio](https://cloud.ibm.com/catalog/services/watson-studio) - WHERE AND HOW THIS IS USED IN OUR SOLUTION

### Solution architecture


![image](https://github.com/user-attachments/assets/300d8116-7427-4e1b-be9b-39e42c304e5a)


- **User Interaction**:
    
    - The user interacts with a **React Native Expo app** available on **Android, iOS**, and as a **WebApp**.
- **Authentication**:
    
    - **Firebase Auth** is used for authenticating the user.
- **Data Storage**:
    
    - **Firebase Firestore** is utilized as the database for storing user data.
- **Food Data**:
    
    - The app retrieves food information from the **Nutritionix FoodBase** using:
        - **Search by Foodname** (text input).
        - **Search by Image** processed by **Watsonx.ai**.
- **AI Processing**:
    
    - **Watsonx.ai** handles image processing and provides food recommendations based on medical conditions.
    - The **Meta Llama Vision model** is integrated into the workflow to process images and extract relevant data.
- **Diet and Health Recommendations**:
    
    - **Watsonx.ai** provides recommendations based on user preferences and medical conditions.
    - **Healthy Diet Recipes** are generated and displayed in the app.
- **Restaurant Search**:
    
    - The app helps users find **Healthy Restaurants near them** based on their location, using a **Database** to store and retrieve relevant information.

## Presentation materials

_INSTRUCTIONS: The following deliverables should be officially posted to your My Team > Submissions section of the [Call for Code Global Challenge resources site](https://cfc-prod.skillsnetwork.site/), but you can also include them here for completeness. Replace the examples seen here with your own deliverable links._

### Solution demo video

[![Watch the video](https://raw.githubusercontent.com/Liquid-Prep/Liquid-Prep/main/images/readme/IBM-interview-video-image.png)](https://youtu.be/vOgCOoy_Bx0)

### Project development roadmap

The project currently does the following things.

- Firebase Auth
- Personalized diet assistant
- Search and Track Food by its Name
- Search and Track Food by its image
- Food recommendation based on medical condition
- Daily personalized consumption tracking


In the future we plan to...
- Healthier diet recipes
- Healthier Restaurants Near me 
## Additional details

### How to run the project

> To further develop this project, clone this repo and make sure you have the following prerequisites.

- [Node](https://nodejs.org/en/download/ "https://nodejs.org/en/download/") ^16.3.0
- [npm](https://nodejs.org/en/download/package-manager/ "https://nodejs.org/en/download/package-manager/")
- [Expo Go](https://expo.dev/client "https://expo.dev/client") on your preferred device

> From your command line go to the folder directory and run the following scripts in the terminal.

1. Clone the repo

Plain Text

```
git clone https://github.com/pratibh13/CalorieTracker.git
```

2. Go to project directory

Plain Text

```
cd /CalorieTracker
```

3. Make a copy of `.env`

Plain Text

```
copy .env.example .env
```

4. Populate the .env file with Firebase , Nutritionix, IBMCLoud API keys

- [Firebase](https://firebase.google.com/ "https://firebase.google.com/")
- [Nutritionix](https://developer.nutritionix.com/ "https://developer.nutritionix.com/")
- [IBM Cloud](https://www.ibm.com/cloud)

5. Install dependencies

```
npm install
```

 
 6. Start the expo


```
npm start
```
 
7. Go to Backend dir
   
```
cd /backend
```

8. Run Backend Server
   
```
uvicorn server:app --host 0.0.0.0 --port 8000
```   


### Live demo

You can find a running system to test at...

See our [description document](./docs/DESCRIPTION.md) for log in credentials.

---

### Developers

<a href="https://github.com/pratibh13/CalorieTracker/graphs/contributors">
  <img src="https://contributors-img.web.app/image?repo=pratibh13/CalorieTracker" />
  <img src="https://contributors-img.web.app/image?repo=Adwait803/myrepo1" />
</a>



### License

This project is licensed under the Apache 2 License - see the [LICENSE](LICENSE) file for details.

