"use strict";

import React, { Component } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  ScrollView,
  CameraRoll,
  Platform,
  PermissionsAndroid
} from "react-native";
import Photo from "./Photo";

const window = Dimensions.get("window");

class PhotoLibrary extends Component {
  state = {
    photos: [],
    message: "Loading..."
  };

  // TODO: maybe all children should just do this by default HOC???
  async componentDidMount() {
    this.props.shouldRenderBackButton(true, this.props.history);
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.setState(await this.accessCameraRoll());
      } else {
        this.setState({
          error: true,
          errorMessage: "Permissions not granted to view photo library"
        });
      }
    } else {
      this.setState(await this.accessCameraRoll());
    }
  }

  accessCameraRoll = () => {
    return CameraRoll.getPhotos({ first: 20 })
      .then(photos =>
        Promise.resolve({
          photos: photos.edges,
          message: !photos.edges.length && "No pictures found!"
        })
      )
      .catch(e =>
        Promise.resolve({
          error: true,
          errorMessage: e.message
        })
      );
  };

  render() {
    return (
      <View style={styles.LibraryViewContainer}>
        <ScrollView contentContainerStyle={styles.photoContainer}>
          {!!this.state.photos.length ? (
            this.state.photos.map(photo => (
              <Photo key={photo.node.image.uri} photo={photo} />
            ))
          ) : (
            <Text>
              {!!this.state.error
                ? this.state.errorMessage
                : this.state.message}
            </Text>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  photoContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: window.width,
    alignSelf: "center"
  }
});

export default PhotoLibrary;
