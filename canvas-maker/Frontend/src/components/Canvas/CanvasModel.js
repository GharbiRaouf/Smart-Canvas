import React from "react";
import PropTypes from "prop-types";

//Material imports
import { withStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import Grid from "@material-ui/core/Grid";
import CardHeader from "@material-ui/core/CardHeader";
import CardContent from "@material-ui/core/CardContent";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import AddIcon from "@material-ui/icons/Add";
import SaveIcon from "@material-ui/icons/Save";
import CircularProgress from '@material-ui/core/CircularProgress';
import { Typography, Avatar, Hidden } from "@material-ui/core";

import Snackbar from "@material-ui/core/Snackbar";
import CloseIcon from "@material-ui/icons/Close";
import StarRatings from "react-star-ratings";

//Misc
import canvas_style from "../../constants/canvasdesign";
import { CanvasModelStyles } from "./assets/canvasstyle.jsx"
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import _ from "lodash";
import {
  getDroppableStyle,
  getItemStyle,
} from "./utils/dnd_func.js"
// import html2canvas from 'html2canvas';

//redux
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import { compose } from 'redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../actions/canvas';
import CanvasNote from "./CanvasNote";

const nanoid = require('nanoid');

function mapStateToProps(state) {
  return {
    token: state.auth.token,
    canvas: state.canvas.canvas,
    canvasMustSave: state.canvas.canvasMustSave,
    userEmail: state.auth.userEmail,
    isAuthenticated: state.auth.isAuthenticated,
    isSaving: state.canvas.isSaving
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actionCreators, dispatch);
}
// const makeCanvas = () => {
//   return html2canvas(document.querySelector("#preview_canvas")).then(canvas => {
//     var extra_canvas = document.createElement("canvas");
//     extra_canvas.setAttribute("width", 320);
//     extra_canvas.setAttribute("height", 180);
//     var ctx = extra_canvas.getContext("2d");
//     ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, 320, 180);
//     var dataURL = extra_canvas.toDataURL("image/png");
//     return dataURL
//   });
//   return "static/media/canvas_preview.png"
// };

class CanvasModel extends React.Component {
  constructor(props) {
    super(props);
    this.onDragEnd = this.onDragEnd.bind(this);

    this.state = {
      openSnack: false,
      NotesCards: props.canvas ? props.canvas.canvas_notes ? props.canvas.canvas_notes : [] : [],
      popperAnchorEl: null,
      lookingForBetterText: false,
      to_suggest_id: null,
      suggestion_field: null,
      suggestion_result: null,
      openRate: false,
    };

  }
  handleSnackClick = (result) => {
    var x = Object.assign({}, result.source);
    result.source = result.destination;
    result.destination = x;
    this.setState({ lastMove: result, openSnack: true });

  };

  handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ openSnack: false });
  };

  handleRollBack = () => {
    this.onDragEnd(this.state.lastMove)
    this.setState({ openSnack: false });

  }
  dispatchNewRoute(route) {
    this.props.changePage(route)
  }
  onDragEnd(result) {
    if (this.props.isShare) return;

    let NotesCards = Array.from(this.state.NotesCards);

    if (
      !result.destination ||
      (result.source === result.destination &&
        result.source.index === result.destination.index)
    ) {
      return;
    }
    let sourceDrop;
    let destinDrop;
    if (result.source.droppableId === result.destination.droppableId) {
      sourceDrop = _.filter(NotesCards, { note_position: result.source.droppableId })
      destinDrop = []
      const [lovelyItem] = sourceDrop.splice(result.source.index, 1)
      sourceDrop.splice(result.destination.index, 0, lovelyItem)
    } else {
      sourceDrop = _.filter(NotesCards, { note_position: result.source.droppableId })
      destinDrop = _.filter(NotesCards, { note_position: result.destination.droppableId })
      const [lovelyItem] = sourceDrop.splice(result.source.index, 1)
      lovelyItem.note_position = result.destination.droppableId
      this.handleSnackClick(result);
      destinDrop.splice(result.destination.index, 0, lovelyItem)
    }
    let stableDrop = _.filter(NotesCards, e => { return ((_.indexOf(sourceDrop, e) < 0) && (_.indexOf(destinDrop, e) < 0)) })
    stableDrop = [...stableDrop, ...sourceDrop, ...destinDrop]
    this.props.mustSaveCanvas()
    this.setState({
      NotesCards: stableDrop
    })
    this.props.updateCanvas("canvas_notes", stableDrop)
  }

  handleAddNote = note_position => {
    if (this.props.isShare) return;

    const { NotesCards } = this.state;
    NotesCards.push({
      note_id: nanoid(),
      note_canvas: this.props.canvas.canvas_id,
      note_author: this.props.userEmail,
      note_color: "#ffeb3b",
      note_description: "",
      note_headline: "",
      note_lastEdited: Date.now(),
      note_position: note_position,
      note_questionNumber: "",
      note_status: "new",
      note_info_expanded: false,
      note_is_supervised: false,
      note_ai_rating: "",
      note_ai_suggestion: "",
      note_admin_rating: "",
      note_admin_suggestion: ""
    });
    this.props.updateCanvas("canvas_notes", NotesCards)
    this.props.mustSaveCanvas()

  };

  handleCanvasDescriptionChange = (event, field) => {
    if (this.props.isShare) return;
    let newdata = ''
    if (field === "canvas_team") {
      newdata = Array.from(this.props.canvas.canvas_team)
      newdata.push({ "user": event, "role": "partner" })
      this.setState({
        newTeamMate: ""
      })
    }
    else newdata = event.target.value;
    this.props.mustSaveCanvas()
    this.props.updateCanvas(field, newdata)
  }

  componentDidMount() {
    document.addEventListener("keydown", (e) => {
      if (e.keyCode === 83 && (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
        // alert('captured');
        this.updateMyCanvas()

      }
    }, false);
    // makeCanvas().then(dataURL => {
    //   if (this.props.isShare) return;
    //   this.setState({
    //     PREVIEW: dataURL
    //   })
    //   console.log(dataURL);

    // })


  }

  updateMyCanvas = () => {
    if (this.props.isShare) return;
    this.props.updateAndSaveCanvas(this.props.canvas, this.state.PREVIEW, this.props.token)
  }
  handleClickForRate = () => {
    this.setState({ openRate: !this.state.openRate });
  };

  changeRating = (newRating) => {
    this.setState({
      rating: newRating,
      openRate: !this.state.openRate
    });
    this.props.updateCanvas("canvas_rating", newRating)
    this.props.updateAndSaveCanvas(this.props.canvas, "rating_update", this.props.token)

  };
  handleDeleteNote = (Note) => {
    if (this.props.isShare) return;
    let index = Note.note_id;
    const { NotesCards } = this.state;
    let id = _.findIndex(NotesCards, { note_id: index });
    NotesCards.splice(id, 1);
    this.props.updateCanvas("canvas_notes", NotesCards)
    this.props.mustSaveCanvas()

    this.setState({
      NotesCards
    });
  };

  render() {
    const { classes, canvas, isShare } = this.props;
    const { NotesCards } = this.state;
    const NoteColumn = (column, canvas_type) => (
      <Grid
        style={{
          padding: "10px",
          height: column.isCompound ? "100%" : "",
          display: "grid"
        }}
        item
        key={column.id}
        lg={column.width}
        xs={12}
      >
        <Card className={classes.card}>
          <CardHeader
            avatar={<Hidden> <Avatar>{column.category.split("-")[0][0]}</Avatar></Hidden>}
            subheader={<Typography variant="subheading">{column.category.split("-").join("\n")}</Typography>}
            action={
              <IconButton
                onClick={() => {
                  this.handleAddNote(column.category);
                }}
              >
                <AddIcon />
              </IconButton>
            }
          />
          <CardContent style={{ padding: 2, height: "100%" }}>
            <Droppable droppableId={column.category}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getDroppableStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  {_
                    .filter(NotesCards, { note_position: column.category })
                    .map((element, index) => (
                      <Draggable
                        key={element.note_id}
                        draggableId={element.note_id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            style={getItemStyle(
                              provided.draggableProps.style,
                              snapshot.isDragging
                            )}
                            key={element.note_id}
                            className={classes.paper}
                          >
                            <CanvasNote handleDeleteNote={this.handleDeleteNote} isSmart={column.isSmart} isShare={this.props.isShare} Note={element} NoteField={_.startCase((canvas_type === "lean_canvas" ? "LMC" : "BMC") + " " + column.category.split("-").join(" "))} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                </div>
              )}
            </Droppable>
          </CardContent>
        </Card>
      </Grid>
    );
    return (
      <div id="preview_canvas">
        {!canvas && <Typography >No Canvas to display! Select one from your Dashboard</Typography>}
        {canvas &&
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Grid container alignItems="stretch">

              {canvas_style[canvas.canvas_type].map(column => {
                if (!column.isCompound) return NoteColumn(column, canvas.canvas_type);
                else
                  return (
                    <Grid key={column.id} item lg={column.width} xs={12} container>
                      {column.items.map(subCol => {
                        return (
                          <div style={{ width: "100%" }} key={subCol.id}>
                            {NoteColumn(subCol, canvas.canvas_type)}
                          </div>
                        );
                      })}
                    </Grid>
                  );
              })}
            </Grid>
          </DragDropContext>
        }
        {isShare && <Button variant="fab" onClick={this.handleClickForRate} className={classes.fab_btn} >Rate!</Button>}
        {isShare && <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right"
          }}
          open={this.state.openRate}
          autoHideDuration={6000}
          onClose={this.handleCloseforRate}
          ContentProps={{
            "aria-describedby": "message-id"
          }}
          message={
            <div>
              <StarRatings
                rating={this.state.rating}
                starRatedColor="orange"
                changeRating={this.changeRating}
                numberOfStars={5}
                starDimension="30px"
                starSpacing="8px"
                name="rating"
              />
            </div>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleClickForRate}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />}
        {
          this.props.canvasMustSave &&
          <Button variant="fab" className={classes.fab} color="primary" onClick={() => this.updateMyCanvas()}>
            {this.props.isSaving ? <CircularProgress /> : <SaveIcon />}
          </Button>
        }
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={this.state.openSnack}
          autoHideDuration={6000}
          onClose={this.handleSnackClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">Note Changing Note may not be appropriate</span>}
          action={[
            <Button key="undo" color="secondary" size="small" onClick={this.handleRollBack}>
              UNDO
            </Button>,
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleSnackClose}
            >
              <CloseIcon />
            </IconButton>,
          ]}
        />
      </div>
    );
  }
}

CanvasModel.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withRouter(compose(
  withStyles(CanvasModelStyles),
  connect(mapStateToProps, mapDispatchToProps),
)(CanvasModel));