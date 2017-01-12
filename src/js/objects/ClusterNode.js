"use strict";

class ClusterNode {

    constructor(){
        this.host = null;
        this.port = null;
        this.role = null;
        this.type = "Cluster Node";
        this.replicates = null;
        this.hash = []; //Array of objects with start and end hash slots to handle
        //Nodes which serve a non-contiguous hash range
        this.slaves = [];
    }

    addHash(range){
        this.hash.forEach(function(r){
            if(r.upper == range.upper && r.lower == range.lower) return false;
        });

        this.hash.push(range);
    }

    delHash(range){
        var _this = this,
            success = false;
            
        this.hash.forEach(function(r, index){
            if(r.upper == range.upper && r.lower == range.lower) {
                _this.hash.slice(index, index+1);
                success = true;
            }
        });

        return success;
    }

    getRole(){
        return this.role;
    }

    setRole(r){
        this.role = r;
    }

    addSlave(s){
        if(this.type == 'master'){
            if(s){
                this.slaves.forEach(function(slave){
                    if(slave != s){
                        this.slaves.push(s);
                    }
                });
            }
            else {
                return;
            }
        }
    }

    delSlave(s){
        if(this.type == 'master'){
            if(s){
                this.slaves.forEach(function(slave, i){
                    this.slaves.splice(i, 1);
                });
            }
            else{
                return;
            }
        }
    }

    getSlaves(){
        if(this.type == 'master'){
            return this.slaves;
        }
    }

    getPort(){
        return this.port;
    }

    getReplicates(){
        if(this.type == 'slave'){
            return this.replicates;
        }
    }

    getHost(){
        return this.host;
    }

    setHost(h){
        this.host = h;
    }

    setPort(p){
        this.port = p;
    }

    setReplicates(r){
        if(this.type == 'slave'){
            this.replicates = r;
        }
    }
}
