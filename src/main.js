import { Loader } from "@googlemaps/js-api-loader";
let map3DElement = null;

function loadGoogleMap(apiKey = '') {
    const loader = new Loader({
        apiKey,
        version: "alpha",
        libraries: ['maps3d']
    });
  
    loader.load().then(async () => {  
        initMap();
    });
}

async function initMap() {
    const { Map3DElement } = await google.maps.importLibrary("maps3d");
    map3DElement = new Map3DElement({
      center: { lat: 0, lng: 0, altitude: 16000000 },
    });

    document.body.append(map3DElement);
    initAutocomplete();
}

async function initAutocomplete() {
    const { Autocomplete } = await google.maps.importLibrary("places");
    const autocomplete = new Autocomplete(
        document.getElementById("pac-input"),
        {
            fields: [
                "geometry",
                "name",
                "place_id"
            ],
        }
    );

    autocomplete.addListener("place_changed", () => {
        //viewer.entities.removeAll();
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.viewport) {
            window.alert("No viewport for input: " + place.name);
            return;
        }
        zoomToViewport(place.geometry);
    });
}

const zoomToViewport = async (geometry) => {
    const { AltitudeMode, Polyline3DElement } = await google.maps.importLibrary("maps3d");
    let viewport = geometry.viewport;

    let locationPoints = [
        { lat: viewport.getNorthEast().lat(), lng: viewport.getNorthEast().lng() },
        { lat: viewport.getSouthWest().lat(), lng: viewport.getNorthEast().lng() },
        { lat: viewport.getSouthWest().lat(), lng: viewport.getSouthWest().lng() },
        { lat: viewport.getNorthEast().lat(), lng: viewport.getSouthWest().lng() },
        { lat: viewport.getNorthEast().lat(), lng: viewport.getNorthEast().lng() }
    ];

    let locationPolyline = new Polyline3DElement({
        altitudeMode: AltitudeMode.CLAMP_TO_GROUND,
        strokeColor: "blue",
        strokeWidth: 10,
        coordinates: locationPoints,
    });

    map3DElement.append(locationPolyline);
    let elevation = await getElevationforPoint(geometry.location);

    if (map3DElement) {
        map3DElement.center = { lat: geometry.location.lat(), lng: geometry.location.lng(), altitude: elevation + 50 };
        map3DElement.heading = 0;
        map3DElement.range = 1000;
        map3DElement.tilt = 65;
    }
};

async function getElevationforPoint(location) {
    const { ElevationService } = await google.maps.importLibrary("elevation");
    // Get place elevation using the ElevationService.
    const elevatorService = new google.maps.ElevationService();
    const elevationResponse = await elevatorService.getElevationForLocations({
        locations: [location],
    });

    if (!(elevationResponse.results && elevationResponse.results.length)) {
        window.alert(`Insufficient elevation data for place: ${place.name}`);
        return;
    }

    const elevation = elevationResponse.results[0].elevation || 10;
    return elevation;
}

/* Main functions start here */
const apiKeyInput = document.querySelector('#api-key-input');
const buttonSubmitApiKey = document.querySelector('.btn-submit-key');

buttonSubmitApiKey.addEventListener('click', handleSubmitApiKey);

function handleSubmitApiKey() {
  const apiKey = apiKeyInput.value;

  loadGoogleMap(apiKey);
}