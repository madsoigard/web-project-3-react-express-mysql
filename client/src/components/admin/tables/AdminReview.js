import React, { Component } from "react"
import AdminReviewItem from '../AdminReviewItem'

class AdminReview extends Component {
  state = { years: [] };

  componentDidMount() {
    this.getData()
  }
  getData = () => {
    fetch('/api/review?year=all')
      .then(response => response.json())
      .then(response => this.structureData(response.data))
      .catch(err => console.log(err))
  }

  structureData = (data) => {
    let years = []
    for (let i = 0; i < data.reviewData.length; i++) {
      let year = data.reviewData[i]
      year.slides = []
      year.recordings = []
      for (let j = 0; j < data.slides.length; j++) {
        if (data.slides[j].r_id === year.id) year.slides.push(data.slides[j])
      }
      for (let j = 0; j < data.recordings.length; j++) {
        if (data.recordings[j].r_id === year.id) year.recordings.push(data.recordings[j])
      }

      years.push(year)
    }
    this.setState({ years: years })
  }

  handleSubmit = () => {
    let body = {
      year: this.refs.newYear.value,
      text: this.refs.newText.value
    }

    fetch('/api/review/newReview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then((response) => {
        response.json()
        this.refs.newYear.value = ''
        this.refs.newText.value = ''
        this.refs.newReviewForm.click()
        this.getData()
      })
      .catch(err => console.log(err))
  }

  handleDelete = (id, slides) => {
    let body = { id: id, slides: slides }
    if (window.confirm('Er du sikker på at du vil slette tilbakeblikket?')) {
      fetch('/api/review/deleteReview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(response => {
          this.getData()
        })
        .catch(err => console.log(err))
    }
  }


  render() {
    return (
      <>
        <div className="container tablesAdmin col-md-9 col-lg-10">
          <button
            className=" createNewBtn btn btn-info btn-sm"
            type="button"
            ref="newReviewForm"
            data-toggle="collapse"
            data-target="#newReviewForm"
            aria-expanded="false"
            aria-controls="newReviewForm"
          >
            Legg til nytt år i tilbakeblikk
          </button>
          <div className="collapseForm col-12 collapse" id="newReviewForm">
            <form className="col-md-8 col-lg-6" onSubmit={this.handleSubmit}>
              <div className="form-row">
                <div className="form-group col-md-2">
                  <label>År</label>
                  <input
                    type="number"
                    ref="newYear"
                    className="form-control"
                    required
                  ></input>
                </div>
              </div>
              <div className="form-group">
                <label>Tekst</label>
                <textarea
                  type="text"
                  ref="newText"
                  className="form-control"
                  required />

              </div>
              <button type="submit" className="btn btn-info btn-sm">
                Send
              </button>
              <p>*Du kan redigere og legge til bilder og opptak etter du har opprettet elementet</p>
            </form>
          </div>

          {/* Lists all existing review elements */}
          {this.state.years.map((year, index) => (
            <AdminReviewItem key={index} year={year} handleDelete={this.handleDelete} />
          ))}
        </div>
      </>
    );
  }
}

export default AdminReview;
