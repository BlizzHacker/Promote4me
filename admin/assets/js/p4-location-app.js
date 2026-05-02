$( document ).ready( function() {
    var location_map = null;
    var location_table = null;
    var search_locations = new Array();
    var searching = false;
    var search_keyword = "";

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
            div: '#location_map_container',
            lat: center_lat,
            lng: center_lng,
            zoom: 11,
            dragend : function( e )
            {
                var center = location_map.getCenter();

                center_lat = center.lat();
                center_lng = center.lng();

                if( searching ) {
                    location_search( search_keyword );
                }
            }
        }
    );

    location_table = $( '#data-table' ).DataTable( 
        {
            deferRender:    true,
            dom:            "frtiS",
            scrollY:        320,
            scrollCollapse: true,
            columnDefs : 
            [ 
                { 
                    "targets" : 0,
                    "width" : "100px",
                    render : function( data , type , row , meta ) {
                        return "<a href='javascript:;' class='add_location' data-lat='" + row[3] + "' data-lng='" + row[4] + "' data-name='" + row[1] + "' data-address='" + row[2] + "'>Add Location</a>";
                    }
                },
                {
                    "targets" : [3,4],
                    "visible" : false
                }
            ]
        }
    );

    service = new google.maps.places.PlacesService( location_map.map );

    $('#p4_location_search_bar').keydown( function(e) {
        if( e.keyCode == 13 ) {
            searching = true;
            location_search( $( this ).val() );
        }
    });

    function render_gmaps_locations( locations ) {
        location_map.removeMarkers();
        location_table.rows().remove();
        location_table.draw();

        $( locations ).each( function() {
            var location_result = this;

            var location_name = location_result.name;
            var location_lat = location_result.geometry.location.lat();
            var location_lng = location_result.geometry.location.lng();
            var location_address = location_result.vicinity;

            var location_html = "";
            location_html += "<h5>" + location_name + "</h5>";
            location_html += "<p>" + location_address + "</p>";
            location_html += "<button class='btn btn-success btn-block add_location' data-lat='" + location_lat + "' data-lng='" + location_lng + "'>Add Location</button>";

            location_table.row.add( [ "Add" , location_result.name , location_result.vicinity , location_lat , location_lng ] );

            location_table.draw();

            location_map.addMarker(
                {
                    lat : location_lat,
                    lng : location_lng,
                    title : location_name,
                    infoWindow : { content : location_html }
                }
            );
        });
    }

    function location_search( keyword ) {
        search_locations = new Array();
        search_keyword = keyword;

        service.nearbySearch( 
        {
            location : new google.maps.LatLng( center_lat , center_lng ) ,
            radius : 10000 ,
            keyword : keyword
        },
        function( results , status , pagination ) {

            $( results ).each( function() {
                search_locations.push( this );
            });

            render_gmaps_locations( search_locations );
        });
    }

    $( '#add_all_locations' ).click( function() {
        $( location_table.rows().data() ).each( function() {
            location_name = this[1];
            location_address = this[2];
            location_lat = this[3];
            location_lng = this[4];

            api_add_location( location_name , location_address , location_lat , location_lng );

            location_table.rows().remove();
            $( '#p4_location_search_bar' ).val( "" );
            searching = false;
            location_map.removeMarkers();
        });
    });

    $( '#data-table' ).on( 'click' , '.add_location' , function() {
        var location_name = $( this ).attr( 'data-name' );
        var location_address = $( this ).attr( 'data-address' );
        var location_lat = $( this ).attr( 'data-lat' );
        var location_lng = $( this ).attr( 'data-lng' );

        api_add_location( location_name , location_address , location_lat , location_lng );
    });

    $( "#location_map_container" ).on( 'click' , '.add_location' , function() {
        var parent = $( this ).parent();
        var location_name = parent.children( 'h5' ).text();
        var location_address = parent.children( 'p' ).text();
        var location_lat = $( this ).attr( 'data-lat' );
        var location_lng = $( this ).attr( 'data-lng' );

        api_add_location( location_name , location_address , location_lat , location_lng );
    });

    function api_add_location( name , address , lat , lng ) {
        $.ajax({
            dataType : "json",
            url : SUBSCRIBER_API + "/addlocation",
            method : "POST",
            data : 
            {
                "token" : $.cookie("access_token"),
                "name" : name,
                "address" : address,
                "lat" : lat,
                "lng" : lng
            },
            success : function(data)
            {

            }
        });
    }
});