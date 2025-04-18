## Short Description Of The Project

#Astriverse-Smart City 3D Viewer

An immersive full-stack web platform for visualizing, designing, and managing 3D smart cities. Users can upload or create 3D models, organize them into custom cityscapes, view live traffic/weather/air quality/population overlays using Google Maps APIs, and collaborate in real time via chat.

## Features:
1. JWT-based user authentication
2. Upload `.glb` 3D models (stored via MongoDB GridFS)
3. **Create 3D models directly in the browser** using basic primitives
4. Interactive scene rendering with Three.js
5. Model manipulation: move, rotate, scale, snap to grid
6. Save/load custom scenes (per user)
7. Google Maps overlays for:
  - 🛣️ Real-time traffic
  - 🌤️ Live weather
  - 🌫️ Air quality index
  - 👥 Population data
8. **Real-time chat** for user collaboration using Socket.IO
9. Clean, modern UI built with Tailwind CSS


## Technologies Used:

Frontend - Next.js, React.js, Tailwind CSS, Three.js   

Backend - Node.js, Express.js, Socket.IO 

Database - MongoDB with GridFS for model storage         |

***Pre Requisites
1.Node.js installed
2.MongoDB accessible via MongoDb atlas
3.npm

# Project setup
- Clone the repository
```shell
 git clone https://github.com/Sweety102003/Smart-City-.git 
```
- Go to Smart-City directory
```shell
cd ./Smart-City-/ 
```
- Create a .env file with the following variables
```.env
mongourl="..."
jwt_secret="..."
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."
NEXT_PUBLIC_TOMTOM_KEY="..."
NEXT_PUBLIC_OPENWEATHER_API="..."
NEXT_PUBLIC_GEONAMES_USER="..."
```
- Run the following commands
``` shell
npm install
npm run dev
```
**Contact
For issues and support, please contact hoodasweety890@gmail.com

