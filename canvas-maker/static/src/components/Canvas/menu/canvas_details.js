import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";

import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import Input from "@material-ui/core/Input";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import InputAdornment from "@material-ui/core/InputAdornment";
import AddIcon from "@material-ui/icons/Add";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";

import { canvasDetailsStyles } from "../assets/canvasstyle";
import { canvasTeamStyles } from "../assets/canvasstyle";

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom'
import { compose } from 'redux';
import { bindActionCreators } from 'redux';
import * as actionCreators from '../../../actions/canvas';
import { SERVER_URL } from "../../../constants/utils";



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

class CanvasDetails extends React.Component {
    state = { expanded: false };
    handleExpandClick = () => {
        this.setState(state => ({ expanded: !state.expanded }));
    };
    handleCanvasDescriptionChange = (event, field) => {
        if(this.props.isShare) return;
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
    render() {
        const { classes } = this.props;

        return (
            <Paper elevation={0} className={classes.card}>
                <Typography variant="display1">Canvas Details</Typography>
                <Grid container spacing={8}>
                    <Grid item xs={12} />
                    <Grid item xs={12}>
                        <TextField label="Canvas Name" 
                        value={this.props.canvas.canvas_name}
                        onChange={e=>{this.handleCanvasDescriptionChange(e,'canvas_name')}}/>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            value={this.props.canvas.canvas_description}
                            onChange={e=>{this.handleCanvasDescriptionChange(e,'canvas_description')}}
                            multiline={true}
                            rows={2}
                            label="Canvas Description"
                        />
                    </Grid>
                    {/* <Grid item xs={12}>
                        <Input
                            fullWidth
                            value={this.state.newTeamMate}
                            placeholder="Tags"
                            id="teams"
                            className={classes.input}
                            onChange={e => this.setState({ newTeamMate: e.target.value })}
                            inputProps={{
                                "aria-label": "Description"
                            }}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() =>
                                            this.handleCanvasDescriptionChange(
                                                this.state.newTeamMate,
                                                "canvas_team"
                                            )
                                        }
                                    >
                                        <AddIcon />
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </Grid>
                    <Grid item xs={12} spacing={8}>
                        {[
                            {
                                user: "Canvas",
                                role: "Admin"
                            }
                        ].map((member, index) => {
                            return (
                                <Chip
                                    key={index}
                                    label={member.user}
                                    color="primary"
                                    onDelete={null}
                                    avatar={<Avatar>{member.role[0]}</Avatar>}
                                    variant="outlined"
                                />
                            );
                        })}
                    </Grid> */}
                </Grid>
            </Paper>
        );
    }
}

CanvasDetails.propTypes = {
    classes: PropTypes.object.isRequired
};


export default withRouter(compose(
    withStyles(canvasDetailsStyles),
    connect(mapStateToProps, mapDispatchToProps),
)(CanvasDetails));