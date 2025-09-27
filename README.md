# BeWareAPI
BeWare is your travelbuddy social media API . Travelers and tourists can share their experience about visiting a place so future travelers can beware of the to-dos and not-to-dos when visiting a place. 
### Features
- A user can mark a post as helpful or unhelpful.
- Each user has a contribution count which is the sum of helpfulness in all his posts
- Filter posts by location, username, postid filters
- Users can add a short bio, their country with their name and username in their profiles which can be viewed along with their reputation by others
- Posts include location, must visit places, avoid places, food recommendations, money-saving tips, norms to follow in the locality and extra tips

You can check the live site on https://bewareapi.onrender.com/interactive_api/.
If you get: 	```Failed to fetch.
Possible Reasons:
CORS
Network Failure
URL scheme must be "http" or "https" for CORS request.```
wait a while and reload the website.

## Run locally
### Make sure you have nodejs installed. If you don't, download from [HERE](https://nodejs.org/en/download) 

- Copy .env.example to .env
- Fill in your own values in the .env
#### Install dependencies
`$ npm install ` 
#### Run the Server
`$ npm start`

Generally the server will start on port 3000.
Head to http://localhost:3000/interactive_api/ to interact with the interactive swagger documentations.
