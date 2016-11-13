<?php
//
// Description
// -----------
// This method will search the existing users for an email.
//
// Arguments
// ---------
// api_key:
// auth_token:
// start_needle:    The string to search for a matching email.
// search_limit:    (optional) The maximum number of entries to return. 
//                  If not specified, the default limit is 11.
//
//
function qruqsp_admin_userSearch($q) {
    //
    // Find all the required and optional arguments
    //
    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'prepareArgs');
    $rc = qruqsp_core_prepareArgs($q, 'no', array(
        'start_needle'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Search String'), 
        'limit'=>array('required'=>'no', 'default'=>'11', 'blank'=>'yes', 'name'=>'Limit'), 
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    $args = $rc['args'];

    //
    // Check access 
    //
    qruqsp_core_loadMethod($q, 'qruqsp', 'admin', 'private', 'checkAccess');
    $rc = qruqsp_admin_checkAccess($q, 0, 'qruqsp.core.userSearch');
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    //
    // Query for the user by email
    //
    $strsql = "SELECT id, email, username, callsign, license, perms, status, display_name "
        . "FROM qruqsp_core_users "
        . "WHERE email LIKE '" . qruqsp_core_dbQuote($q, $args['start_needle']) . "%' "
        . "OR username LIKE '" . qruqsp_core_dbQuote($q, $args['start_needle']) . "%' "
        . "OR callsign LIKE '" . qruqsp_core_dbQuote($q, $args['start_needle']) . "%' "
        . "OR display_name LIKE '" . qruqsp_core_dbQuote($q, $args['start_needle']) . "%' "
        . "LIMIT " . qruqsp_core_dbQuote($q, $args['limit']) . " "
        . "";

    qruqsp_core_loadMethod($q, 'qruqsp', 'core', 'private', 'dbHashQueryArrayTree');
    $rc = qruqsp_core_dbHashQueryArrayTree($q, $strsql, 'qruqsp.core', array(
        array('container'=>'users', 'fname'=>'id', 'fields'=>array('id', 'email', 'username', 'callsign', 'license', 'perms', 'status', 'display_name')),
        ));
    return $rc;
}
?>
