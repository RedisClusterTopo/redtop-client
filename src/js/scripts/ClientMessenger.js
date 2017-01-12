var clientID;

$(document).ready(function () {
    //Request a socket
    var socket = io('http://localhost:8080');

    //Pass the key/value pair submitted to identify the client
    clientID = JSON.parse(localStorage.id);
    socket.emit('init app', clientID);

    //Server response to app initalization
    socket.on('topo init', function(in_topo){

        //Parse -> draw graphics for the initial data
        parse(in_topo, function(parsed_topo){
            generate_topo(parsed_topo); //Pass the parsed topology to graphics
        });


        //Refresh topology data on a 30sec interval
        setInterval(function(){

            //Request an update to the topology data
            socket.emit('update topo', clientID);

        }, 15000);

    });

    socket.on('topo init test', function(){
        //generate redtop object
        var generator = new ClusterGen();

        generator.generate(function(newCluster) {
            generate_topo(newCluster)
        });
    });


    //Update to topology state is received
    socket.on('topo update', function(topo_data){

        //Parse -> draw for updates to the topology
        parse(topo_data, function(parsed_topo){
            generate_topo(parsed_topo); //Pass the parsed topology to graphics
        });

    });

    socket.on('client not found', function(){
        window.alert("Client ID not found. Returning to tag entry page");
        location.href = 'http://localhost:8080';
    });


    //Error is received from the server (Dev purposes only)
    socket.on('err', function(e){
        console.log(e);
    });

});
