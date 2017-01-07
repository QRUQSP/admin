//
// This app is for sysadmins to change the details of the install
//
function qruqsp_admin_main() {
    //
    // The main account panel
    //
    this.menu = new Q.panel('System Admin', 'qruqsp_admin_main', 'menu', 'mc', 'narrow', 'sectioned', 'qruqsp.admin.main.menu');
    this.menu.sections = {
        'stations':{'label':'Stations', 'list':{
            'add':{'label':'Add Station', 'fn':'Q.qruqsp_admin_main.station.open(\'Q.qruqsp_admin_main.menu.show();\');'},
            'all':{'label':'Stations', 'fn':'Q.qruqsp_admin_main.stations.open(\'Q.qruqsp_admin_main.menu.show();\');'},
        }},
        'users':{'label':'Users', 'list':{
//            'sysadmins':{'label':'Sys Admins', 'fn':'Q.qruqsp_admin_main.sysadmins.open(\'Q.qruqsp_admin_main.menu.show();\');'},
//            'locked':{'label':'Locked Users', 'fn':'Q.qruqsp_admin_main.lockedusers.open(\'Q.qruqsp_admin_main.menu.show();\');'},
            'all':{'label':'All Users', 'fn':'Q.qruqsp_admin_main.users.open(\'Q.qruqsp_admin_main.menu.show();\');'},
        }},
        'system':{'label':'System', 'list':{
            'database':{'label':'Table Versions', 'fn':'Q.qruqsp_admin_main.dbtables.open(\'Q.qruqsp_admin_main.menu.show();\');'},
//            'code':{'label':'Code Versions', 'fn':'Q.qruqsp_admin_main.code.open(\'Q.qruqsp_admin_main.menu.show();\');'},
//            'modules':{'label':'Module Usage', 'fn':'Q.qruqsp_admin_main.modules.open(\'Q.qruqsp_admin_main.menu.show();\');'},
        }},
    }
    this.menu.addClose('Back');

    //
    // The panel to display the list of stations
    //
    this.stations = new Q.panel('Stations', 'qruqsp_admin_main', 'stations', 'mc', 'narrow', 'sectioned', 'qruqsp.admin.main.stations');
    this.stations.sections = {
        'stations':{'label':'Stations', 'type':'simplegrid', 'num_cols':1, 
            'headerValue':null,
            'addTxt':'Add Station',
            'addFn':'Q.qruqsp_admin_main.station.open(\'Q.qruqsp_admin_main.stations.open();\',0,[]);',
            },
    }
    this.stations.cellValue = function(s, i, j, d) {
        switch(j) {
            case 0: return d.name;
        }
    }
    this.stations.rowFn = function(s, i, d) {
        return 'Q.qruqsp_admin_main.station.open(\'Q.qruqsp_admin_main.stations.open();\',\'' + d.id + '\',Q.qruqsp_admin_main.stations.data.nplist);';
    }
    this.stations.open = function(cb) {
        Q.api.getJSONCb('qruqsp.core.stationList', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            var p = Q.qruqsp_admin_main.stations;
            p.data = rsp;
            p.refresh();
            p.show(cb);
        });
    }
    this.stations.addClose('Back');

    //
    // The panel to edit station details
    //
    this.station = new Q.panel('Station', 'qruqsp_admin_main', 'station', 'mc', 'medium', 'sectioned', 'qruqsp.admin.main.station');
    this.station.data = null;
    this.station.station_id = 0;
    this.station.nplist = [];
    this.station.sections = {
        'general':{'label':'', 'aside':'yes','fields':{
            'name':{'label':'Name', 'type':'text'},
            'category':{'label':'Category', 'type':'text'},
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'Q.qruqsp_admin_main.station.save();'},
//            'delete':{'label':'Delete', 
//                'visible':function() {return Q.qruqsp_admin_main.station.station_id > 0 ? 'yes' : 'no'; },
//                'fn':'Q.qruqsp_admin_main.station.remove();'},
            }},
        };
    this.station.fieldValue = function(s, i, d) { return this.data[i]; }
//    this.station.fieldHistoryArgs = function(s, i) {
//        return {'method':'qruqsp.core.stationHistory', 'args':{'station_id':Q.curStationID, 'station_id':this.station_id, 'field':i}};
//    }
    this.station.open = function(cb, sid, list) {
        if( sid != null ) { this.station_id = sid; }
        if( list != null ) { this.nplist = list; }
        Q.api.getJSONCb('qruqsp.core.stationGet', {'station_id':this.station_id}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            var p = Q.qruqsp_admin_main.station;
            p.data = rsp.station;
            p.refresh();
            p.show(cb);
        });
    }
    this.station.save = function(cb) {
        if( cb == null ) { cb = 'Q.qruqsp_admin_main.station.close();'; }
        if( !this.checkForm() ) { return false; }
        if( this.station_id > 0 ) {
            var c = this.serializeForm('no');
            if( c != '' ) {
                Q.api.postJSONCb('qruqsp.core.stationUpdate', {'station_id':this.station_id}, c, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        Q.api.err(rsp);
                        return false;
                    }
                    eval(cb);
                });
            } else {
                eval(cb);
            }
        } else {
            var c = this.serializeForm('yes');
            console.log(c);
            Q.api.postJSONCb('qruqsp.core.stationAdd', {}, c, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp);
                    return false;
                }
                Q.qruqsp_admin_main.station.station_id = rsp.id;
                eval(cb);
            });
        }
    }
    this.station.nextButtonFn = function() {
        if( this.nplist != null && this.station_id > 0 && this.nplist.indexOf('' + this.station_id) < (this.nplist.length - 1) ) {
            return 'Q.qruqsp_admin_main.station.save(\'Q.qruqsp_admin_main.station.open(null,' + this.nplist[this.nplist.indexOf('' + this.station_id) + 1] + ');\');';
        }
        return null;
    }
    this.station.prevButtonFn = function() {
        if( this.nplist != null && this.station_id > 0 && this.nplist.indexOf('' + this.station_id) > 0 ) {
            return 'Q.qruqsp_admin_main.station.save(\'Q.qruqsp_admin_main.station.open(null,' + this.nplist[this.nplist.indexOf('' + this.station_id) - 1] + ');\');';
        }
        return null;
    }
    this.station.addButton('save', 'Save', 'Q.qruqsp_admin_main.station.save();');
    this.station.addClose('Cancel');
    this.station.addButton('next', 'Next');
    this.station.addLeftButton('prev', 'Prev');

    //
    // the panel for the user administration
    //
    this.users = new Q.panel('All Users', 'qruqsp_admin_main', 'users', 'mc', 'medium', 'sectioned', 'qruqsp.admin.main.users');
    this.users.sections = {
        'search':{'label':'', 'type':'livesearchgrid', 'livesearchcols':4,
            'cellClasses':['multiline', 'multiline'],
            'noData':'No users found',
            },
        '_tabs':{'label':'', 'type':'paneltabs', 'selected':'users', 'tabs':{
            'users':{'label':'All', 'fn':'Q.qruqsp_admin_main.users.switchTab(\'users\');'},
            'locked':{'label':'Locked', 'fn':'Q.qruqsp_admin_main.users.switchTab(\'locked\');'},
            'sysadmins':{'label':'Admins', 'fn':'Q.qruqsp_admin_main.users.switchTab(\'sysadmins\');'},
            }},
        'users':{'label':'', 'type':'simplegrid', 'num_cols':4, 
            'sortable':'yes',
            'headerValues':['Callsign', 'Username', 'Status', 'Privileges'],
            'cellClasses':['multiline', 'multiline', '', ''],
            'sortTypes':['text','text','text','text']
            },
        };
    this.users.liveSearchCb = function(s, i, value) {
        if( s == 'search' && value != '' ) {
            Q.api.getJSONBgCb('qruqsp.admin.userSearch', {'start_needle':value}, function(rsp) {
                Q.qruqsp_admin_main.users.liveSearchShow('search', null, Q.gE(Q.qruqsp_admin_main.users.panelUID + '_' + s), rsp.users);
            });
        }
    };
    this.users.liveSearchResultValue = function(s, f, i, j, d) { return this.cellValue(s, i, j, d); };
    this.users.liveSearchResultRowFn = function(s, f, i, j, d) { return this.rowFn(s, i, d); };
    this.users.sectionData = function(s) {
        if( s == 'users' && this.sections._tabs.selected != 'users' ) {
            var data = [];
            for(var i in this.data) {
                if( (this.sections._tabs.selected == 'locked' && this.data[i].status == 10)
                    || (this.sections._tabs.selected == 'sysadmins' && (this.data[i].perms&0x01) == 0x01)
                    ) {
                    data[i] = this.data[i];
                }
            }
            return data;
        }
        return this.data;
    }
    this.users.cellValue = function(s, i, j, d) { 
        if( j == 0 ) { 
            return '<span class="maintext">' + d.callsign + '</span><span class="subtext">' + d.license + '</span>';
        }
        if( j == 1 ) { 
            return '<span class="maintext">' + d.username + ' <span class="subdue">[' + d.display_name + ']</span>'
                + '</span><span class="subtext">' + d.email + '</span>';
        }
        if( j == 2 ) {
            switch(d.status) {
                case '1': return 'Active';
                case '10': return 'Locked';
                case '11': return 'Deleted';
            }
            return '';
        }
        else if( j == 3 ) {
            var p = '';
            if( (this.data[i].perms & 0x01) ) { p += (p != '' ? ', ' : '') + 'sysadmin'; }
            if( (this.data[i].perms & 0x02) ) { p += (p != '' ? ', ' : '') + 'admin'; }
            if( (this.data[i].perms & 0x04) ) { p += (p != '' ? ', ' : '') + 'www'; }
            return p;
        }
        return '';
    }
    this.users.switchTab = function(tab) {
        this.sections._tabs.selected = tab;
        this.refreshSection('_tabs');
        this.refreshSection('users');
    }
    this.users.rowFn = function(s, i, d) { 
        return 'Q.qruqsp_admin_main.user.open(\'Q.qruqsp_admin_main.users.open();\',\'' + d.id + '\');';
    }
    this.users.noData = function() { 
        switch (this.sections._tabs.selected) {
            case 'users':return 'No users found';
            case 'locked':return 'No locked users found';
            case 'sysadmins':return 'No sysadmins found';
        }
    }
    this.users.open = function(cb) {
        Q.api.getJSONCb('qruqsp.admin.userList', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            var p = Q.qruqsp_admin_main.users;
            p.data = rsp.users;
            p.refresh();
            p.show(cb);
        });
    }
    this.users.addClose('Back');

    //  
    // Setup the panel to show the details of a user
    //  
    this.user = new Q.panel('User', 'qruqsp_admin_main', 'user', 'mc', 'medium mediumaside', 'sectioned', 'qruqsp.admin.main.user');
    this.user.user_id = 0;
    this.user.data = null;
    this.user.sections = {
        'info':{'label':'', 'aside':'yes', 'list':{
            'callsign':{'label':'Callsign', 'value':''},
            'license':{'label':'License', 'value':''},
            'username':{'label':'Username', 'value':''},
            'email':{'label':'Email', 'value':''},
            'display_name':{'label':'Display Name', 'value':''},
            'status':{'label':'Status', 'value':''},
            'timeout':{'label':'Timeout', 'value':''},
            'perms':{'label':'Permissions', 'value':''},
            'date_added':{'label':'Added', 'value':''},
            'last_updated':{'label':'Updated', 'value':''},
            'last_login':{'label':'Last Login', 'value':''},
            'last_pwd_change':{'label':'Pwd Updated', 'value':''},
            }},
        '_buttons':{'label':'', 'aside':'yes', 'buttons':{
            'resetpassword':{'label':'Reset Password', 'fn':'Q.qruqsp_admin_main.user.resetPassword();'},
            'setpassword':{'label':'Set Password', 'fn':'Q.qruqsp_admin_main.user.setPassword();'},
            }},
        'businesses':{'label':'Businesses', 'type':'simplegrid', 'num_cols':1, 'headerValues':null},
        'authlogs':{'label':'Auth Log', 'type':'simplegrid', 'num_cols':2, 'limit_rows':5,
            'headerValues':['User','IP/Session'],
            'cellClasses':['multiline', 'multiline'],
            'addTxt':'More...',
            'addFn': 'Q.qruqsp_admin_main.authlogs.open(\'Q.qruqsp_admin_main.user.open();\',Q.qruqsp_admin_main.user.user_id);',
            },  
        };
    this.user.user_id = 0;
    this.user.sectionData = function(s) {
        if( s == 'businesses' ) { return this.data.businesses; }
        if( s == 'authlogs' ) { return this.data.authlogs; }
        return this.sections[s].list;
    };
    this.user.listLabel = function(s, i, d) {
        if( d.label != null ) {
            return d.label;
        }
    }; 
    this.user.listValue = function(s, i, d) { 
//        if( i == 'name' ) { return this.data.callsign; }
        if( s == 'logs' ) { return d.value; }
        if( i == 'timeout' && this.data.timeout == '0' ) { return 'default'; }
        if( i == 'perms' && parseInt(this.data.perms) == 0 ) { return '-'; }
        if( i == 'perms' && (parseInt(this.data.perms)&0x01) == 0x01 ) { return 'Sysadmin'; }
        if( i == 'status' ) {
            switch(this.data.status) {
                case '1': return 'Active';
                case '10': return 'Locked';
                case '11': return 'Deleted';
            }
            return 'Unknown';
        }
        return this.data[i];
    };
    this.user.cellValue = function(s, i, j, d) {
        if( s == 'businesses' ) { return d.business.name; }
        if( s == 'authlogs' ) {
            switch(j) {
                case 0: return '<span class=\'maintext\'>' + d.display_name + '</span><span class=\'subtext\'>' + d.age + '</span>';
                case 1: return '<span class=\'maintext\'>' + d.ip_address + '</span><span class=\'subtext\'>' + d.session_key + '</span>';
            }
        }
        // FIXME: add button to remove user from the business
    };
    this.user.rowFn = function(s, i, d) {
        if( s == 'authlogs' ) {
            return 'Q.qruqsp_admin_main.actionlogs.open(\'Q.qruqsp_admin_main.user.show();\', ' + Q.qruqsp_admin_main.user.user_id + ',\'' + d.session_key + '\');';
        }
    };
    this.user.listFn = function(s, i, d) {
        if( s == 'logs' && i == 'authlogs' ) {
            return 'Q.qruqsp_admin_main.authlogs.open(\'Q.qruqsp_admin_main.user.show();\', ' + Q.qruqsp_admin_main.user.user_id + ');';
        }
        if( s == 'authlogs' ) {
            return 'Q.qruqsp_admin_main.actionlogs.open(\'Q.qruqsp_admin_main.user.show();\', ' + Q.qruqsp_admin_main.user.user_id + ',\'' + d.session_key + '\');';
        }
        return null;
    };
    this.user.noData = function(s) { 
        if( s == 'authlogs' ) { return 'No auth logs'; }
        return 'No businesses found'; 
    };
    this.user.open = function(cb, id) {
        if( id != null ) { this.user_id = id; }
        // 
        // Setup the data for the details form
        //
        Q.api.getJSONCb('qruqsp.core.userGet', {'user_id':this.user_id}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            var p = Q.qruqsp_admin_main.user;
            p.data = rsp.user;

            if( rsp.user.status == 11 ) {
                p.sections._buttons.buttons._delete = {'label':'Restore user', 'fn':'Q.qruqsp_admin_main.user.undelete();'};
            } else {
                if( rsp.user.status == 1 ) {
                    p.sections._buttons.buttons._lock = {'label':'Lock user', 'fn':'Q.qruqsp_admin_main.user.lock();'};
                } else if( rsp.user.status == 10 ) {
                    p.sections._buttons.buttons._lock = {'label':'Unlock user', 'fn':'Q.qruqsp_admin_main.user.unlock();'};
                }
                p.sections._buttons.buttons._delete = {'label':'Delete user', 'fn':'Q.qruqsp_admin_main.user.delete();'};
            }
            if( (rsp.user.perms&0x01) == 0x01 ) {
                p.sections._buttons.buttons._sysadmin = {'label':'Remove Sysadmin', 'fn':'Q.qruqsp_admin_main.user.removeSysAdmin();'};
            } else {
                p.sections._buttons.buttons._sysadmin = {'label':'Make Sysadmin', 'fn':'Q.qruqsp_admin_main.user.makeSysAdmin();'};
            }

            p.refresh();
            p.show(cb);

            Q.api.getJSONCb('qruqsp.admin.authLogs', {'user_id':p.user_id, 'limit':'6'}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp);
                    return false;
                }
                var p = Q.qruqsp_admin_main.user;
                p.data.authlogs = rsp.logs;
                p.refreshSection('authlogs');
            });
        });
    }
    this.user.resetPassword = function() {
        if( confirm("Are you sure you want to reset their password?") ) {
            Q.api.getJSONCb('qruqsp.core.userResetPassword', {'user_id':this.user_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp); 
                    return false;
                }
                alert("Their password has been reset and emailed to them.");
            });
        }
    }
    this.user.setPassword = function() {
        var newpassword = prompt("New password:", "");
        if( newpassword != null && newpassword != '' ) {
            Q.api.postJSONCb('qruqsp.core.userSetPassword', {'user_id':this.user_id}, 'password='+encodeURIComponent(newpassword),
                function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        Q.api.err(rsp);
                        return false;
                    }
                    alert('Password set');
                });
        } else {
            alert('No password specified, nothing changed');
        }
    }
    this.user.lock = function() {
        if( this.user_id > 0 ) {
            Q.api.getJSONCb('qruqsp.core.userLock', {'user_id':this.user_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp);
                    return false;
                }
                Q.qruqsp_admin_main.user.open();
            });
        }
    }
    this.user.unlock = function() {
        if( this.user_id > 0 ) {
            Q.api.getJSONCb('qruqsp.core.userUnlock', {'user_id':this.user_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp);
                    return false;
                }
                Q.qruqsp_admin_main.user.open();
            });
        }
    }
    this.user.delete = function() {
        if( confirm('Are you sure you want to delete ' + this.data.callsign + '?') == true ) {
            Q.api.getJSONCb('qruqsp.core.userDelete', {'business_id':Q.curBusinessID, 'user_id':this.user_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp);
                    return false;
                }
                Q.qruqsp_admin_main.user.open();
            });
        }
    }
    this.user.undelete = function() {
        Q.api.getJSONCb('qruqsp.core.userUndelete', {'business_id':Q.curBusinessID, 'user_id':this.user_id}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            Q.qruqsp_admin_main.user.open();
        });
    }
    this.user.makeSysAdmin = function() {
        if( confirm('Are you sure you want to make ' + this.data.callsign + ' a System Admin?') == true ) {
            Q.api.getJSONCb('qruqsp.core.userUpdate', {'business_id':Q.curBusinessID, 'user_id':this.user_id, 'perms':'1'}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp);
                    return false;
                }
                Q.qruqsp_admin_main.user.open();
            });
        }
    }
    this.user.removeSysAdmin = function() {
        if( confirm('Are you sure you want to remove ' + this.data.callsign + ' as a System Admin?') == true ) {
            Q.api.getJSONCb('qruqsp.core.userUpdate', {'business_id':Q.curBusinessID, 'user_id':this.user_id, 'perms':'0'}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp);
                    return false;
                }
                Q.qruqsp_admin_main.user.open();
            });
        }
    }
    this.user.addButton('edit', 'Edit', 'Q.qruqsp_admin_main.useredit.open(\'Q.qruqsp_admin_main.user.open();\', Q.qruqsp_admin_main.user.user_id);');
    this.user.addClose('Back');

    //
    // The panel to show the auth log history
    //
    this.authlogs = new Q.panel('Logs', 'qruqsp_admin_main', 'authlogs', 'mc', 'medium', 'sectioned', 'qruqsp.admin.main.authlogs');
    this.authlogs.user_id = 0;
    this.authlogs.data = null;
    this.authlogs.dataOrder = 'reverse';        // Display the newest logs at the top
    this.authlogs.sections = { 
        '_info':{'label':'', 'type':'simplegrid', 'num_cols':3, 'limit_rows':5,
            'headerValues':['username','IP/Session'],
            'cellClasses':['multiline', 'multiline'],
        },  
    };  
    this.authlogs.sectionData = function(s) { return this.data; }
    this.authlogs.cellValue = function(s, i, j, data) { 
        switch(j) {
            case 0: return '<span class=\'maintext\'>' + data.display_name + '</span><span class=\'subtext\'>' + data.age + '</span>';
            case 1: return '<span class=\'maintext\'>' + data.ip_address + '</span><span class=\'subtext\'>' + data.session_key + '</span>';
        }
    }
    this.authlogs.open = function(cb, uid) {
        if( uid != null && uid != 0 ) { this.user_id = uid; }
        Q.api.getJSONCb('qruqsp.admin.authLogs', {'user_id':this.user_id, 'limit':'100'}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            var p = Q.qruqsp_admin_main.authlogs;
            p.data = rsp.logs;
            p.refresh();
            p.show(cb);
        });
    }
    this.authlogs.addClose('Back');

    //
    // The panel for the action logs for a user
    //
    this.actionlogs = new Q.panel('Action Logs', 'qruqsp_admin_main', 'actionlogs', 'mc', 'wide', 'sectioned', 'qruqsp.admin.main.actionlogs');
    this.actionlogs.data = null;
    this.actionlogs.dataOrder = 'reverse';      // Display the newest logs at the top
    this.actionlogs.sections = { 
        '_info':{'label':'', 'type':'simplegrid', 'num_cols':2,
            'headerValues':['User','Action'],
            'cellClasses':['multiline', 'multiline'],
        },  
    };  
    this.actionlogs.sectionData = function(s) { return this.data; }
    this.actionlogs.cellValue = function(s, i, j, data) { 
        switch(j) {
            case 0: return '<span class="maintext">' + data.display_name + '</span><span class="subtext">' + data.age + '</span>';
            case 1: return '<span class="maintext">' + data.name + ' - ' + data.method + '</span><span class="subtext">' + data.action + '</span>';
        }
    }
    this.actionlogs.open = function(cb, uid, sid) {
        if( uid != null && uid != 0 ) { this.user_id = uid; }
        if( sid != null && sid != 0 ) { this.session_key = sid; }
        Q.api.getJSONCb('qruqsp.admin.actionLogs', {'session_key':this.session_key}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            var p = Q.qruqsp_admin_main.actionlogs;
            p.data = rsp.logs;
            p.refresh();
            p.show(cb);
        });
    }
    this.actionlogs.addClose('Close');

    //
    // The edit panel
    //
    this.useredit = new Q.panel('Edit', 'qruqsp_admin_main', 'useredit', 'mc', 'medium', 'sectioned', 'qruqsp.admin.main.useredit');
    this.useredit.user_id = 0;
    this.useredit.data = null;
    this.useredit.sections = {
        'name':{'label':'Contact', 'fields':{
            'callsign':{'label':'Call Sign', 'type':'text'},
            'license':{'label':'License', 'type':'text'},
            'display_name':{'label':'Display', 'type':'text'},
            }},
        'login':{'label':'Login', 'fields':{
            'email':{'label':'Email', 'type':'text'},
            'username':{'label':'Username', 'type':'text'},
            'timeout':{'label':'Timeout', 'size':'small', 'type':'text'},
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'Q.qruqsp_admin_main.useredit.save();'},
            }},
    };
    this.useredit.sectionData = function(s) { return this.data; }
    this.useredit.fieldValue = function(s, i, d) { 
        if( s == 'details' ) { return this.data.details[i]; }
        return this.data[i]; 
    }
    this.useredit.fieldHistoryArgs = function(s, i) {
        return {'method':'qruqsp.core.userHistory', 'args':{'user_id':this.user_id, 'field':i}};
    }
    this.useredit.open = function(cb, uid) {
        if( uid != null ) { this.user_id = uid; }
        Q.api.getJSONCb('qruqsp.core.userGet', {'user_id':this.user_id}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            var p = Q.qruqsp_admin_main.useredit;
            p.data = rsp.user;
            p.refresh();
            p.show(cb);
            });
    }
    this.useredit.save = function() {
        var c = this.serializeForm('no');
        if( c != '' ) {
            Q.api.postJSONCb('qruqsp.core.userUpdate', {'user_id':this.user_id}, c, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    Q.api.err(rsp);
                    return false;
                }
                Q.qruqsp_admin_main.useredit.close();
            });
        } else {
            this.close();
        }
    };
    this.useredit.addButton('save', 'Save', 'Q.qruqsp_admin_main.useredit.save();');
    this.useredit.addClose('Cancel');

    //
    // the panel for the database table information
    //
    this.dbtables = new Q.panel('Table Versions', 'qruqsp_admin_main', 'dbtables', 'mc', 'medium', 'sectioned', 'qruqsp.admin.main.dbtables');
    this.dbtables.sections = {
        '_':{'label':'', 'type':'simplegrid', 'num_cols':3, 
            'headerValues':['Table', 'Database', 'Current'],
            },
        };
    this.dbtables.sectionData = function(s) { return this.data; }
    this.dbtables.cellClass = function(s, i, j, d) {
        if( d.database_version != d.schema_version ) {
            return 'alert';
        }
        return null;
    }
    this.dbtables.cellValue = function(s, i, j, d) {
        switch(j) {
            case 0: return i;
            case 1: return this.data[i].database_version;
            case 2: return this.data[i].schema_version;
        }
        return '';
    }
    this.dbtables.open = function(cb) {
        Q.api.getJSONCb('qruqsp.core.adminDBTableVersions', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                Q.api.err(rsp);
                return false;
            }
            var count = 0;
            var p = Q.qruqsp_admin_main.dbtables;
            p.data = {};
            //
            // Add the tables which need upgrading first, so they appear at the top of the list
            //
            for(i in rsp.tables) {
                // outdated tables
                if( rsp.tables[i].database_version != rsp.tables[i].schema_version ) {
                    p.data[i] = rsp.tables[i];
                    count++;
                }
            }
            for(i in rsp.tables) {
                // Current tables
                if( rsp.tables[i].database_version == rsp.tables[i].schema_version ) {
                    p.data[i] = rsp.tables[i];
                    count++;
                }
            }
            p.refresh();
            p.show(cb);
        });
    }
    this.dbtables.upgrade = function() {
        Q.api.getJSONCb('qruqsp.core.adminDBUpgradeTables', {}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                alert("Error: #" + rsp.err.code + ' - ' + rsp.err.msg);
                return false;
            }
            Q.qruqsp_admin_main.dbtables.open();
        });
    }
    this.dbtables.addButton('update', 'Upgrade', 'Q.qruqsp_admin_main.dbtables.upgrade();');
    this.dbtables.addClose('Back');

    //
    // The function to start this app
    //
    this.start = function(cb, ap, aG) {
        args = {};
        if( aG != null ) {
            args = eval(aG);
        }

        //
        // Create the app container if it doesn't exist, and clear it out
        // if it does exist.
        //
        var appContainer = Q.createContainer('mc', 'qruqsp_admin_main', 'yes');
        if( appContainer == null ) {
            alert('App Error');
            return false;
        } 

        this.menu.show(cb);
    }
}
