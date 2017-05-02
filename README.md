# redtop-client

The redtop-client solution contains the necessary information for parsing the Redtop object that is provided by the redtop-server.
The client should be located in the same directory as the "redtop"and "server" solutions by default. You can edit the gulp file located
within the Redtop solution if you wish to move the solutions.

The client contains the following:
client/src/js/scripts/

    aws-login.js -       This file contains the logic for the initial login page of Redtop.

    ClientMessenger.js - This file contains the logic for communicating with the server.
                         In Redtop we use sockets in order to communicate back and forth with the server
                         The sockets will handle updates-which is used for the actual deployment version.
                         The generate random socket event will generate a random cluster configuration for debug purposes.

    ClusterGen.js -      This file is specifically for debug purposes. As mentioned above our client messenger handles a generate
                         random event. The generate random event calls cluster gen in order to create a random cluster.
                         You can customize the size of the cluster at the top of the file.

    Graphics.js -        This is the meat and potatoes of the client side of Redtop. This file will parse the redtop object and display it to
                         the user as a d3 tree. Graphics will also handle all of the highlighting and selecting of the cluster objects. If an object happens to be
                         selected it will send a call over to the info bar with the proper information about the selected object.

    InfoBar.js -         The info bar will be dynamically generated based on what object has been selected and what state the object is in. We dynamically create       
                         jquery object and attach them to a side bar that uses bootstrap.


Note: no direct setup is required for client as the gulp file in redtop will handle building everything.      
