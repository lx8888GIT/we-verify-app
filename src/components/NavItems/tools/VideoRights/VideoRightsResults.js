import {Paper, Table, TableBody, TableCell, TableHead, TableRow} from "@material-ui/core";
import useMyStyles from "../../../utility/MaterialUiStyles/useMyStyles";
import React from "react";
import Typography from "@material-ui/core/Typography";
import Checkbox from "@material-ui/core/Checkbox";
import BlockIcon from '@material-ui/icons/Block';
import CheckCircleOutlineIcon from '@material-ui/icons/CheckCircleOutline';
import ErrorOutlineIcon from '@material-ui/icons/ErrorOutline';
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";

import YouTubeIcon from '@material-ui/icons/YouTube';
import TwitterIcon from '@material-ui/icons/Twitter';
import FacebookIcon from '@material-ui/icons/Facebook';
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import invidLogo from "./images/InVID-logo.svg"
import SvgIcon from "@material-ui/core/SvgIcon";
import Icon from "@material-ui/core/Icon";

const VideoRightsResults = (props) => {

    const classes = useMyStyles();

    const result = props.result;

    console.log(result);

    /*
    "youTubeVideos"
    "facebookVideos"   ===> result.kind
    "twitterVideos"    also url ====> result.RIGHTS_APP
    */

    const licenceText = (string) => {
        switch (string) {
            case"youTubeVideos":
                return "Creative Commons License Summary";
            case "twitterVideos":
                return "Twitter License Summary";
            case "facebookVideos":
                return "Facebook License Summary";
            case "creativeCommon":
                return;
            default:
                return null
        }
    };
    const permittedList = [];
    const prohibitedList = [];
    const requiredList = [];

    result.terms.map(term => {
        const component = (<div>
            <Typography variant={"h6"}>{term.action}</Typography>
            <Typography variant={"body2"}>{term.description}</Typography>
        </div>);
        switch (term.status) {
            case "Permitted":
                permittedList.push(component);
                return;
            case "Prohibited":
                prohibitedList.push(component);
                return;
            case "Required":
                requiredList.push(component);
                return;
            default:
                return;
        }
    });

    const licenceDetails = [
        {
            title: "Permitted",
            elements: permittedList,
            icon: <CheckCircleOutlineIcon fontSize={"large"}/>,
            color: classes.buttonOk
        },
        {
            title: "Prohibited",
            elements: prohibitedList,
            icon: <BlockIcon fontSize={"large"}/>,
            color: classes.buttonError
        },
        {
            title: "Required",
            elements: requiredList,
            icon: <ErrorOutlineIcon fontSize={"large"}/>,
            color: classes.buttonWarning
        },
    ];

    return (
        <Paper className={classes.root}>
            <Typography variant={"h5"}>{"Reuse Conditions"}</Typography>
            <Box m={2}/>
            {
                result.kind === "youTubeVideos" && result.licence === "youtube" &&
                <Typography variant={"body2"}>
                    {
                        result.licence = "YouTube License Summary"
                    }
                    {
                        "This video is licensed under the Standard YouTube license, defined in YouTube's"
                    }
                    <a href={"https://www.youtube.com/static?template=terms"}
                       rel="noopener noreferrer"
                       target={"_blank"}
                    >
                        {"Terms of Service"}
                    </a>
                    {
                        "Moreover, it is from a"
                    }
                    <a href={"https://support.google.com/youtube/answer/72851?hl=en"}
                       rel="noopener noreferrer"
                       target={"_blank"}
                    >
                        {
                            "YouTube Content Partner"
                        }
                    </a>
                    {
                        ", likely the content owner and potentially monetizing it."
                    }
                </Typography>
            }
            {
                result.licence === "creativeCommon" &&
                <Typography variant={"body2"}>
                    {
                        result.licence = "Creative Commons License Summary"
                    }
                    {
                        "This video is licensed under a Creative Commons Attribution license"
                    }
                    <a href={"https://creativecommons.org/licenses/by/3.0/"}
                       rel="noopener noreferrer"
                       target={"_blank"}
                    >
                        {
                            "(details)"
                        }
                    </a>
                </Typography>
            }
            {
                result.kind === "twitterVideos" &&
                <Typography variant={"body2"}>
                    {
                        result.licence = "Twitter License Summary"
                    }
                    {
                        "This video is licensed under the Standard Twitter license, defined in Twitter's"
                    }
                    <a href={"https://twitter.com/tos"}
                       rel="noopener noreferrer"
                       target={"_blank"}
                    >
                        {"Terms of Service"}
                    </a>
                </Typography>
            }
            {
                result.kind === "facebookVideos" &&
                <Typography variant={"body2"}>
                    {
                        result.licence = "Facebook License Summary"
                    }
                    {
                        "This video is licensed under the Standard Facebook license, defined in Facebook's"
                    }
                    <a href={"https://www.facebook.com/legal/terms"}
                       rel="noopener noreferrer"
                       target={"_blank"}
                    >
                        {"Terms of Service"}
                    </a>
                </Typography>
            }
            <Box m={4}/>
            <Divider/>
            <Box m={4}/>
            <Typography variant={"h5"}>{result.licence}</Typography>
            <Box m={2}/>
            {
                licenceDetails.map((obj, index) => {
                    if (obj.elements.length > 0) {
                        return (
                            <Paper key={index} className={classes.root} elevation={3}>
                                <Button variant={"contained"}
                                        className={obj.color}
                                        disableFocusRipple={true}
                                        disableRipple={true}
                                        startIcon={obj.icon}
                                >
                                    <Typography variant={"h6"}>
                                        {obj.title}
                                    </Typography>
                                </Button>
                                {
                                    obj.elements.map((div, index) => {
                                        return (
                                            <Box key={index} className={classes.textPaper} >
                                                {div}
                                            </Box>
                                        )
                                    })
                                }
                            </Paper>
                        )
                    } else return null;
                })
            }
            <Box m={4}/>
            <Divider/>
            <Box m={4}/>
            <Typography variant={"h5"}>{"Contact"}</Typography>
            <Box m={2}/>
            <Typography variant={"body2"}>
                For other uses, it is recommended to contact the video uploader and <b>request permission</b>:
            </Typography>
            <List component="nav" aria-label="main mailbox folders" textAlign={"center"}>
                <ListItem button>
                    <ListItemIcon>
                        <div>
                            {
                                (result.kind === "youTubeVideos") &&
                                <YouTubeIcon color={"primary"} fontSize={"large"}/>
                            }
                            {
                                (result.kind === "facebookVideos") &&
                                <FacebookIcon color={"primary"} fontSize={"large"}/>
                            }
                            {
                                (result.kind === "twitterVideos") &&
                                <TwitterIcon color={"primary"} fontSize={"large"}/>
                            }
                        </div>
                    </ListItemIcon>
                    <ListItemText>
                        <a href={result.user.url} target="_blank"> {result.user.name}</a>
                    </ListItemText>
                </ListItem>
                <ListItem button>
                    <ListItemIcon>
                        <Icon classes={{root: classes.iconRoot}}>
                            <img className={classes.imageIcon} src={invidLogo}/>
                        </Icon>
                    </ListItemIcon>
                    <ListItemText>
                        Or try: <a href={result.RIGHTS_APP + "/" + result.id} target="_blank">
                        InVID Rights Management Tool
                    </a>.
                    </ListItemText>
                </ListItem>
            </List>
            <Box m={4}/>
            <Divider/>
            <Box m={4}/>
            <Typography variant={"h5"}>{"Copyright Exceptions"}</Typography>
            <Box m={2}/>
            <Typography variant={"body2"}>
                <b>Exceptionally</b>, in some jurisdictions, this video might be directly reused to report about
                <b>current events</b> under <b>copyright exceptions</b> like
                <a href="http://copyrightexceptions.eu/#Art. 5.3(c)" target="_blank"><b>use by the press</b></a> or
                <a href="http://infojustice.org/wp-content/uploads/2015/03/fair-use-handbook-march-2015.pdf"
                   target="_blank">
                    <b>fair user/fair dealing</b></a>. This reuse is under your or your organization sole responsibility
                and,
                in any case, proper <b>attribution</b> should be provided.
            </Typography>
            <Box m={4}/>
            <Divider/>
            <Box m={4}/>
            <Typography variant={"h5"}>{"How to Give Attribution"}</Typography>
            <Box m={2}/>
            <Typography variant={"body2"}>
                {
                    result.attribution
                }

            </Typography>
        </Paper>
    )
};
export default VideoRightsResults;