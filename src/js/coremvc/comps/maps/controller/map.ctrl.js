tetra.controller.register('map', {
	scope: 'maps',
	constr : function(me, app, page, orm) { return {
		events : {
			controller : {
				'maps: api loaded' : function(api){
					me.maps= {};
					me.markers= {};
					me.infoWindow= {};
					me.center= {};
					me.bounds= {};
					me.markerPath= (api.marker) || '/v_img/global/marker.png';
				},
				'maps: set map' : function(params){
					if(typeof(google) === "undefined") return;
					/*
					 * Creates a new map inside of the given HTML container (id),
					 * which is typically a DIV element — using any (optional) parameters that are passed.
					 * */

					var options= {
						zoom: 12,
						zoomControl: true,
						streetViewControl: true,
						streetViewControlOptions: {
							position: google.maps.ControlPosition.RIGHT_TOP
						},
						zoomControlOptions: {
							style : google.maps.ZoomControlStyle.SMALL
						},
						mapTypeControl: false,
						mapTypeId: google.maps.MapTypeId.ROADMAP
					};

					var map = new google.maps.Map(document.getElementById(params.mapId), options);

					me.markers[params.mapId]= [];
					me.center[params.mapId]= map.getCenter();
					me.bounds[params.mapId]= new google.maps.LatLngBounds();
					me.maps[params.mapId]= map;

					me.infoWindow[params.mapId]= new google.maps.InfoWindow({
						maxWidth: 300,
						pixelOffset : new google.maps.Size(-10, 0)
					});

					// Enable the new design (exp:3.14)
					google.maps.visualRefresh= true;
					me.methods.setStyle_314(map);

					// remove commentary to rollback the new design
					//google.maps.visualRefresh = false;
					//me.methods.setStyle(map);

					// resolve scrollbar issue of infowindow content
					document.getElementById(params.mapId).style.lineHeight = "normal";
				},
				'maps: set options' : function(params){
					me.maps[params.mapId].setOptions(params.options);
				},
				'maps: get map' : function(params){
					// return map object
					params.cbk(me.maps[params.mapId]);
				},
				'maps: set marker' : function (params) {
					var
						marker= new google.maps.Marker({
							map: me.maps[params.mapId],
							position: new google.maps.LatLng(params.latLng[0], params.latLng[1]),
							title: params.title
						})
					;

					marker.setIcon(me.methods.getIcons().icon());
					marker.setShape(me.methods.getIcons().shape());

					if(params.infoWindow) {
						me.methods.setInfoWindow({
							mapId: params.mapId,
							marker: marker,
							content: params.infoWindow.content,
							event: params.infoWindow.event
						});
					}

					me.bounds[params.mapId].extend(new google.maps.LatLng(params.latLng[0], params.latLng[1]));
					me.markers[params.mapId].push(marker);

					if(params.cbk) params.cbk(marker);
				},
				'maps: unset marker' : function (marker) {
					marker.setMap(null);
				},
				'maps: unset markers' : function (id) {
					var
						markers= me.markers[id],
						i= 0,
						l= markers.length
					;
					for (;i<l;i++) markers[i].setMap(null);
				},
				'maps: get markers' : function (params) {
					params.cbk(me.markers[params.mapId]);
				},
				'maps: set center' : function (params) {
					/*latlng:[lat, lng]*/
					me.maps[params.mapId].setCenter( new google.maps.LatLng(params.latLng[0], params.latLng[1]));
					me.center[params.mapId] = me.maps[params.mapId].getCenter();
				},

				'maps: fit bounds' : function (id) {
					// relative center from markers
					 if(me.markers[id].length>0){
						me.maps[id].fitBounds(me.bounds[id]);
						google.maps.event.addListenerOnce(me.maps[id], 'bounds_changed', function(event) {
							/* we only needed to fix the zoom for the inital page load
							* so, we remove it instantly while performing action
							*/
								me.maps[id].setZoom( Math.min( 12, Math.max(2, me.maps[id].getZoom()) ) );
							})
						;
						me.center[id] = me.bounds[id].getCenter();
					 }
				},

				'maps: set bounds' : function (params) {
					me.bounds[params.mapId] = new google.maps.LatLngBounds(params.latLng[0], params.latLng[1]);
				},

				'maps: set zoom' : function (params) {
					me.maps[params.mapId].setZoom(params.zoom);
				},

				'maps: set infoWindow' : function (params) {
					me.methods.setInfoWindow(params);
				}
			}
		},
		methods : {
			setInfoWindow : function (params) {
				google.maps.event.addListenerOnce(me.maps[params.mapId], 'idle', function(){
					if(typeof(params.content) === "string" && params.content !== ""){
						google.maps.event.addListener(params.marker, 'click', function (e) {
							me.infoWindow[params.mapId].setContent(params.content);
							me.infoWindow[params.mapId].open(me.maps[params.mapId], params.marker);
						});
						google.maps.event.addListener(me.infoWindow[params.mapId], 'closeclick', function (e) {
							me.maps[params.mapId].panTo(me.center[params.mapId]);
						});
						if(typeof(params.event) === "string" && params.event === "onload") {
							setTimeout(function(){
								google.maps.event.trigger(params.marker, 'click');
							},100);
						}
					}
				});
			},
			getIcons: function () {
				return {
					icon: function ()  {
						return new google.maps.MarkerImage(
							me.markerPath,
							new google.maps.Size(50,45),
							new google.maps.Point(0,0),
							new google.maps.Point(25,45)
						)
					},
					shape: function () {
						return {
							coord: [22,0,25,1,28,2,29,3,30,4,32,5,32,6,33,7,34,8,35,9,35,10,35,11,36,12,36,13,36,14,37,15,37,16,37,17,37,18,37,19,37,20,37,21,37,22,36,23,36,24,36,25,35,26,35,27,35,28,34,29,33,30,33,31,32,32,32,33,31,34,30,35,30,36,29,37,29,38,28,39,27,40,27,41,26,42,26,43,25,44,24,45,24,46,23,47,23,48,22,49,19,50,18,50,15,49,14,48,14,47,13,46,13,45,12,44,11,43,11,42,10,41,10,40,9,39,8,38,8,37,7,36,7,35,6,34,5,33,5,32,4,31,4,30,3,29,2,28,2,27,2,26,1,25,1,24,1,23,0,22,0,21,0,20,0,19,0,18,0,17,0,16,0,15,1,14,1,13,1,12,2,11,2,10,2,9,3,8,4,7,5,6,5,5,7,4,8,3,9,2,12,1,15,0,22,0],
							type: 'poly'
						}
					}
				};
			},
			setStyle_314 : function (map, styleId) {
				/* style for the realease 3.14 */
				var viadeoStyles =
					[
					    {
					        "featureType": "road.highway",
					        "elementType": "geometry.stroke",
					        "stylers": [
					            {
					                "hue": "#ff8800"
					            },
					            {
					                "gamma": 1
					            },
					            {
					                "saturation": -87
					            },
					            {
					                "lightness": 29
					            }
					        ]
					    },
					    {
					        "featureType": "road",
					        "elementType": "geometry.fill",
					        "stylers": [
					            {
					                "lightness": 100
					            }
					        ]
					    },
					    {
					        "featureType": "road.highway",
					        "elementType": "labels",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "road.arterial",
					        "elementType": "labels.icon",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "road.local",
					        "elementType": "labels.icon",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "administrative.locality",
					        "elementType": "labels.icon",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "poi",
					        "elementType": "geometry.fill",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "hue": "#d9ccbe"
					            }
					        ]
					    },
					    {
					        "featureType": "poi",
					        "elementType": "labels",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "poi.park",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "lightness": 0
					            },
					            {
					                "color": "#c8df9f"
					            }
					        ]
					    }
					];

			    map.setOptions({styles:viadeoStyles});
			},
			setStyle : function (map, styleId) {
			    // Create a new StyledMapType object, passing it the array of styles,
			    // as well as the name to be displayed on the map type control.

				var viadeoStyles =
					[
					    {
					        "featureType": "landscape",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "landscape.natural",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "color": "#e8e0d8"
					            }
					        ]
					    },
					    {
					        "featureType": "water",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "color": "#73b6e6"
					            }
					        ]
					    },
					    {
					        "featureType": "water",
					        "elementType": "labels",
					        "stylers": [
					            {
					                "color": "#2a75aa"
					            }
					        ]
					    },
					    {
					        "featureType": "water",
					        "elementType": "labels.text.stroke",
					        "stylers": [
					            {
					                "lightness": 100
					            },
					            {
					                "weight": 2
					            }
					        ]
					    },
					    {
					        "featureType": "road",
					        "elementType": "geometry.fill",
					        "stylers": [
					            {
					                "lightness": 100
					            }
					        ]
					    },
					    {
					        "featureType": "road.highway",
					        "elementType": "geometry.stroke",
					        "stylers": [
					            {
					                "hue": "#ff8800"
					            },
					            {
					                "gamma": 1
					            },
					            {
					                "saturation": -87
					            },
					            {
					                "lightness": 29
					            }
					        ]
					    },
					    {
					        "featureType": "road.highway",
					        "elementType": "labels",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "road.arterial",
					        "elementType": "geometry.fill",
					        "stylers": [
					            {
					                "lightness": 100
					            }
					        ]
					    },
					    {
					        "featureType": "road.arterial",
					        "elementType": "geometry.stroke",
					        "stylers": [
					            {
					                "hue": "#ff8800"
					            },
					            {
					                "gamma": 1
					            },
					            {
					                "saturation": -87
					            },
					            {
					                "lightness": 29
					            }
					        ]
					    },
					    {
					        "featureType": "road.arterial",
					        "elementType": "labels.text.fill",
					        "stylers": [
					            {
					                "color": "#000000"
					            }
					        ]
					    },
					    {
					        "featureType": "road.arterial",
					        "elementType": "labels.text.stroke",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "hue": "0xffffff"
					            },
					            {
					                "lightness": 100
					            },
					            {
					                "weight": 2.5
					            }
					        ]
					    },
					    {
					        "featureType": "road.arterial",
					        "elementType": "labels.icon",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "road.local",
					        "elementType": "labels.text.fill",
					        "stylers": [
					            {
					                "color": "#7a7a7a"
					            }
					        ]
					    },
					    {
					        "featureType": "road.local",
					        "elementType": "labels.icon",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "administrative.country",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "color": "#5b5b5b"
					            },
					            {
					                "weight": 0.5
					            }
					        ]
					    },
					    {
					        "featureType": "administrative.country",
					        "elementType": "labels.text.stroke",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "lightness": 100
					            },
					            {
					                "weight": 3
					            }
					        ]
					    },
					    {
					        "featureType": "administrative.locality",
					        "elementType": "labels.icon",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "administrative.locality",
					        "elementType": "labels.text.stroke",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "lightness": 100
					            },
					            {
					                "weight": 4.9
					            }
					        ]
					    },
					    {
					        "featureType": "poi",
					        "elementType": "geometry.fill",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "color": "#d9ccbe"
					            }
					        ]
					    },
					    {
					        "featureType": "poi",
					        "elementType": "labels",
					        "stylers": [
					            {
					                "visibility": "off"
					            }
					        ]
					    },
					    {
					        "featureType": "poi.park",
					        "elementType": "geometry",
					        "stylers": [
					            {
					                "visibility": "on"
					            },
					            {
					                "lightness": 0
					            },
					            {
					                "color": "#c8df9f"
					            }
					        ]
					    }
					];

			    map.setOptions({styles:viadeoStyles});
			}
		}
	};}
});