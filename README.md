# explore-page

Nodejs project that runs the eyewire.org/explore landing page.

    Development:
        npm install
        gulp && gulp watch
        npm start # will start on localhost port 3000

        # to share on the local network
        sudo PORT=80 NODE_ENV=development node --harmony app.js

    Production:
        npm install
        gulp --production
        sudo PORT=80 NODE_ENV=production node --harmony --production app.js

Note:    
	- Requires gulp (http://gulpjs.com/)   
	- Requires babel (https://babeljs.io/)  