//
// This file is for qruqsp bigboard App and  panels included in the bigboard App
// bigboard is the App
function qruqsp_admin_bigboard() {
    // Define the panels
    this.main = new Q.panel('Bigboard', 'qruqsp_admin_bigboard', 'main', 'mc', 'medium', 'sectioned', 'qruqsp.admin.bigboard.main');
        // mc = main container
        // medium = size which could be large, narrow ...
        // qruqsp.admin.bigboard.main = help id argument to know which UI panel caused an error
    this.main.sections={
        'users':{'label':'Active Users', 'type':'simplegrid', 'num_cols':2, 'headerValues':['Name','Date'], 'sortable':'yes', 'sortTypes':['text', 'date']},
    }

    this.main.cellValue=function(s, i, j, d) {
        // s = section
        // i = row
        // j = column
        // d = data for row
        switch(j){
            case 0: return d.display_name;
            case 1: return d.log_date;
        }
    }

    this.main.open = function(cb) {
        // Call the activeOps API from the core module and execute the function as an argument
        Q.api.getJSONCb('qruqsp.core.activeOps', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            // define p as the panel and then reference p going forward
            var p = Q.qruqsp_admin_bigboard.main;
            p.data = rsp;
            p.refresh();
            p.show(cb);
        });
    }

    this.main.addClose('Back');

    // operator1 last_seen 
        // timestamp frequency mode callsign callsign traffic1 
    // operator2 last_seen
        // timestamp frequency mode callsign callsign traffic1 
    this.start = function(cb, ap, aG) {
        // cb = callback
        // ap = app prefix
        // aG = arguments

        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = Q.createContainer('mc', 'qruqsp_admin_bigboard', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        this.main.open(cb);
    } // start
}
