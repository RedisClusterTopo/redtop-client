//Min/max possible children to add at each possible node during generation
var min= 1,
    max = 6;

class ClusterGen {
    constructor(){
    }

    generate(cb) {
        var r = new RedTop();
        var _this = this;


        for (var i = 0; i < randomNum(min, max); i++){
            var newAZ = _this.genAZ();
            r.addAvailabilityZone(newAZ);
        }

        r.getAvailabilityZones().forEach(function(az){
            for (var i = 0; i < randomNum(min, max); i++){
                var newSubnet = _this.genSubnet(az);

                for (var j = 0; j < randomNum(min, max); j++){
                    var newInst = _this.genInstance(newSubnet, az);

                    for (var k = 0; j < randomNum(min, max);j++){
                        var newNode = _this.genNode(newInst, newSubnet, az);
                        newInst.addNode(newNode);
                    }
                    newSubnet.addInstance(newInst);
                }
                az.addSubnet(newSubnet);
            }

            r.addAvailabilityZone(az);
        });

        this.fixHash(r, function(r){
            this.fixReplication(r, function(r){

            });
        });


        cb(r);
    }


    fixHash(r){
        //Assign each master node an equal share of the hash values
        var rangeMax = 16384,
            increment = Math.round(rangeMax / r.getNodes().length),
            curHash = 0;


        r.getMasters().forEach(function(node){
            var range = new Object();
            range.lower = curHash;
            range.upper = curHash + increment;

            curHash += increment;
            if(curHash > 16384) curHash = 16384;

            node.addHash(range);
        });
    }

    fixReplication(r, cb){
        //for each slave
        //  select all masters
        //  pick random master
        //      add replicates to slaves
        //      add slave to master's list of slaves
        //      Update slave hash slot range

        cb(r);
    }

    genAZ(){
        var az = new AWS_AvailabilityZone();

        az.setName(randomID());

        return az;
    }

    genSubnet(){
        var s = new AWS_Subnet();

        s.setNetID(randomID());

        return s;
    }

    genInstance(){
        var inst = new EC2Instance();

        inst.setId(randomID());
        inst.setIp(randomIP());

        return inst;
    }

    genNode(inst){
        var n = new ClusterNode();

        n.setHost(inst.getIp());
        n.setPort(randomNum(7000, 12000));

        if(randomNum(0, 1) == 0) n.setRole("Master");
        else n.setRole("Slave");


        return n;
    }
}

function randomIP(){
    var ip = "";

    for(var i = 0; i < 4; i++){
        ip += randomNum(1, 255).toString();
        if (i < 3) ip += ".";
    }

    return ip;
}

function randomNum(min, max){
    return Math.round(Math.random() * (max - min) + min);
}

function randomID(){
    return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 10);;
}
