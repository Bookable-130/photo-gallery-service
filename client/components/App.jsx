/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable import/extensions */
import React from 'react';
import axios from 'axios';
import Header from './Header.jsx';
import PhotoGallery from './PhotoGallery.jsx';
import ModalImages from './ModalImages.jsx';
import styles from '../styles/App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      isLoaded: false,
      clickedPhotoIndex: -1,
      showModal: false,
    };
    this.getPhotoGallery = this.getPhotoGallery.bind(this);
    this.renderView = this.renderView.bind(this);
    this.getClickedPhoto = this.getClickedPhoto.bind(this);
    this.closeModalHandler = this.closeModalHandler.bind(this);
    this.sendSaveName = this.sendSaveName.bind(this);
  }

  componentDidMount() {
    // grab the roomId from typed address in the web
    const roomId = window.location.pathname.split('/')[2];
    this.getPhotoGallery(roomId);
  }

  getPhotoGallery(roomId) {
    axios.get(`/api/photogallery/${roomId}`)
      .then(({ data }) => {
        console.log('data in axios get req', data);
        const imgUrlList = [];
        const descriptionList = [];
        for (let i = 0; i < data[0].room_photos.length; i += 1) {
          imgUrlList.push(data[0].room_photos[i].imageUrl);
          descriptionList.push(data[0].room_photos[i].description);
        }

        const oneListing = {
          room_id: data[0].room_id,
          title: data[0].title,
          ratings: data[0].ratings,
          number_of_reviews: data[0].number_of_reviews,
          isSuperhost: data[0].isSuperhost,
          address: data[0].address,
          isSaved: data[0].save_status[0].isSaved,
          savedName: data[0].save_status[0].name,
          saveId: data[0].save_status[0]._id,
          imageList: imgUrlList,
          imgDescriptionList: descriptionList,
        };

        this.setState({
          isLoaded: true,
          data: oneListing,
        });
      })
      .catch((err) => {
        console.log('err on axios get:', err);
      });
  }

  getClickedPhoto(idx) {
    console.log('app getClickedPhoto-idx', idx);
    this.setState({
      clickedPhotoIndex: idx,
      showModal: true,
    });
  }

  // Update save name & isSaved
  sendSaveName(roomId, saveId, name) {
    console.log('App update save name and about to send axios, roomId & saveId & name', roomId, saveId, name);

    axios.put(`/api/photogallery/${roomId}`, {
      saveId,
      saveName: name,
      isSaved: true,
    })
      // .then((res) => {
      //   console.log('App Update save name Succes', res);
      // })
      .then(this.getPhotoGallery)
      .catch((err) => {
        console.log('err on axios update:', err);
      });
  }

  closeModalHandler(value) {
    this.setState({
      showModal: false,
    });
  }

  renderView() {
    const { isLoaded } = this.state;
    const { clickedPhotoIndex } = this.state;
    const { showModal } = this.state;
    const { imageList, imgDescriptionListimgDescriptionList, isSaved } = this.state.data;

    if (!isLoaded) {
      return (
        <div className={styles.spinner}>
          <div className={styles.bounce1} />
          <div className={styles.bounce2} />
          <div className={styles.bounce3} />
        </div>
      );
    }
    // When clicking each photo, a modal will show up
    if (showModal) {
      return (
        <ModalImages
          data={this.state.data}
          clickedPhotoIndex={this.state.clickedPhotoIndex}
          closeModalHandler={this.closeModalHandler}
          sendSaveName={this.sendSaveName}
        />
      );
    }

    if (imageList.length >= 5) {
      return (
        <div className={styles.bodyContainer}>
          <Header data={this.state.data} sendSaveName={this.sendSaveName} saveId={this.state.data.saveId}/>
          <PhotoGallery data={this.state.data} getClickedPhoto={this.getClickedPhoto} />
        </div>
      );
    }
  }

  // main render()
  render() {
    return this.renderView();
  }
}

export default App;
