$( document ).ready( function() {
    var location_map = null;
    var location_table = null;
    var existing_locations = new Array();

    var center_lat = 40.7500;
    var center_lng = -111.8833;

    var sizeMap = function() {
        var windowHeight = $( window ).height();
        var windowWidth = $( window ).width();
        var headerHeight = $( '#header' ).height();

        $( '#location_map_container' ).css( 'height' , ( ( windowHeight - headerHeight ) / 2 ) + 'px' );
    };

    $( window ).resize( sizeMap );

    sizeMap();

    location_map = new GMaps(
        {
            div : '#location_map_container',
            lat : center_lat,
            lng : center_lng,
            zoom : 11
        }
    );

    location_table = $( '#data-table' ).DataTable( {
        deferRender : true,
        dom : "frtiS",
        scrollY : 320,
        scrollCollapse : true,
        columnDefs : 
        [
            { 
                "targets" : 0,
                "width" : "100px",
                render : function( data , type , row , meta ) {
                    return "<a href='javascript:;' class='remove_location' data-location-id='" + row[3] + "'>Remove Location</a>";
                }
            },
            {
                "targets" : 3,
                "visible" : false
            }
        ]
    });

    function get_current_locations( animate ) {
        animate = typeof animate !== 'undefined' ? animate : true;

        existing_locations = new Array();
        location_table.rows().remove();
        location_map.removeMarkers();

        $.ajax({
            method : "GET",
            url : SUBSCRIBER_API + "/locations?token=" + $.cookie('access_token'),
            success : function( data ) {
                $( data ).each( function() {
                    location_table.row.add( [ "remove" , this.location_name , this.location_address , this.location_id ] );
                    existing_locations.push( this );
                });

                location_table.draw();

                render_api_locations( existing_locations , animate );
            }
        });
    }

    get_current_locations();

    $( '#data-table' ).on( 'click' , '.remove_location' , function() {
        var location_id = $( this ).attr( 'data-location-id' );

        api_remove_location( location_id );
    });

    $( '#location_map_container' ).on( 'click' , '.remove_location' , function() {
        var location_id = $( this ).attr( 'data-location-id' );

        api_remove_location( location_id );
    });

    function api_remove_location( location_id ) {
        $.ajax(
            {
                dataType : 'json',
                url : SUBSCRIBER_API + '/removelocation',
                method : 'POST',
                data : { 'location_id' : location_id },
                success : function( data ) {
                    get_current_locations( false );
                }
            }
        );
    }

    function render_api_locations( locations , animate ) {
        animate = typeof animate !== 'undefined' ? animate : true;

        $( locations ).each( function() {
            var location_result = this;

            var location_name = location_result.location_name;
            var location_lat = location_result.location_lat;
            var location_lng = location_result.location_lng;
            var location_address = location_result.location_address;
            var location_id = location_result.location_id;

            var location_html = "";
            location_html += "<h5>" + location_name + "</h5>";
            location_html += "<p>" + location_address + "</p>";
            location_html += "<button class='btn btn-danger btn-block remove_location' data-location-id='" + location_id + "'>Remove</button>";


            if( animate ) {
                location_map.addMarker(
                    {
                        lat : location_lat,
                        lng : location_lng,
                        title : location_name,
                        infoWindow : { content : location_html },
                        animation : google.maps.Animation.DROP
                    }
                );
            } else {
                location_map.addMarker(
                    {
                        lat : location_lat,
                        lng : location_lng,
                        title : location_name,
                        infoWindow : { content : location_html }
                    }
                );
            }
        });
    }
});