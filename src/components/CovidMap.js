import React, { useState } from "react";
import GoogleMapReact from 'google-map-react';
import { CovidCaseService } from "../CovidCaseService";
import { MapUtils } from "../utils/MapUtils";
import CovidCard from "./CovidCard";
const AnyReactComponent = ({ text }) => <div>{text}</div>;

export default function CovidMap(){
  const defaultProps = {
    center: {
      lat: 40,
      lng: -95
    },
    zoom: 6
  };

  // 变量。大括号空的js object，county -> stateData -> countryData
  const [points, setPoints] = useState({});
  const[boundary, setBoundary] = useState({});
  const[zoomLevel, setZoomLevel] = useState(defaultProps.zoom);
  const renderCovidPoints = () => {
    const covidCards = [];
    const pointsLevel = MapUtils.getPointsLevelByZoomLevel(zoomLevel);
    const pointstoRender = points[pointsLevel];
    // sanity check
    if(!pointstoRender) {
      return covidCards;
    }

    // construct list of covidCards
    if(pointsLevel === 'county') {
      for(const point of pointstoRender) {
        // render 可视范围内的点，within boundary points
        if(MapUtils.isInBoundary(boundary, point.coordinates)) {
          covidCards.push(
          <CovidCard
            title={point.county}
            subTitle={point.province}
            confirmed={point.stats.confirmed}
            deaths={point.stats.deaths}
            lat={point.coordinates.latitude}
            lng={point.coordinates.longitude}
          />
          );
        }
      }
    } else if(pointsLevel === 'state') {
      for(const state in pointstoRender) {
        const point = pointstoRender[state];
        if(MapUtils.isInBoundary(boundary, point.coordinates)) {
          covidCards.push(
            <CovidCard
            title={state}
            subTitle={point.country}
            confirmed={point.confirmed}
            deaths={point.deaths}
            lat={point.coordinates.latitude}
            lng={point.coordinates.longitude}
            />
          )
        }
      }
    } else {
      for(const nation in pointstoRender) {
        const point = pointstoRender[nation];
        if(MapUtils.isInBoundary(boundary, point.coordinates)) {
          covidCards.push(
            <CovidCard
            title={nation}
            confirmed={point.confirmed}
            deaths={point.deaths}
            lat={point.coordinates.latitude}
            lng={point.coordinates.longitude}
            />
          )
        }
      }
    }
    return covidCards;
  }
  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyAviQV9RXcQ0EiD-5FS6Mbogga6hcstJc4" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        onGoogleApiLoaded={() => {
           CovidCaseService.getAllCountyCases() //promise
            .then(response => {
              // 成功回调
              const countyData = response.data;
              const completePoints = MapUtils.convertCovidPoints(countyData);
              setPoints(completePoints)
            }).catch(error => {
              // 失败回调
              console.error(error)

            })
        }}

        onChange={({center, zoom, bounds, marginBounds}) => {
          setZoomLevel(zoom)
          setBoundary(bounds)
        }}
      >
      {renderCovidPoints()}
      </GoogleMapReact>
    </div>
  );
}