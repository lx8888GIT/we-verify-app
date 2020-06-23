import React, {useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useParams} from "react-router-dom";

import {Box, Button,Paper, TextField} from "@material-ui/core";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import DuoIcon from '@material-ui/icons/Duo';
import Divider from "@material-ui/core/Divider";
import Grid from "@material-ui/core/Grid";
import ImageIcon from '@material-ui/icons/Image';
import FaceIcon from "@material-ui/icons/Face";
import Typography from "@material-ui/core/Typography";

import AssistantResult from "./AssistantResult";
import CloseResult from "../../Shared/CloseResult/CloseResult";
import CustomTile from "../../Shared/CustomTitle/CustomTitle";
import ImageGridList from "../../Shared/ImageGridList/ImageGridList";
import VideoGridList from "../../Shared/VideoGridList/VideoGridList";
import {setError} from "../../../redux/actions/errorActions";
import tsv from "../../../LocalDictionary/components/NavItems/tools/Assistant.tsv";
import useMyStyles from "../../Shared/MaterialUiStyles/useMyStyles";
import useLoadLanguage from "../../../Hooks/useLoadLanguage";

import {
    cleanAssistantState, setHelpMessage, setImageVideoSelected,
    setInputUrl, setMediaLists, setProcessUrl, setProcessUrlActions,
    setUrlMode,
} from "../../../redux/actions/tools/assistantActions";
import {
    CONTENT_TYPE, TYPE_PATTERNS,
    matchPattern, selectCorrectActions, KNOWN_LINK_PATTERNS, KNOWN_LINKS,
} from "./AssistantRuleBook";
import history from "../../Shared/History/History";

const Assistant = () => {

    // styles, language, dispatch, scrapers
    const classes = useMyStyles();
    const dispatch = useDispatch();
    const keyword = useLoadLanguage("components/NavItems/tools/Assistant.tsv", tsv);

    //assistant state values
    const {url} = useParams();
    const urlMode = useSelector(state => state.assistant.urlMode);
    const imageVideoSelected = useSelector(state => state.assistant.imageVideoSelected);
    const inputUrl = useSelector(state => state.assistant.inputUrl);
    const processUrl = useSelector(state => state.assistant.processUrl);
    const processUrlActions = useSelector(state => state.assistant.processUrlActions);
    const imageList = useSelector(state => state.assistant.imageList);
    const videoList = useSelector(state => state.assistant.videoList);
    const helpMessage = useSelector(state => state.assistant.helpMessage);

    //other state values
    const [formInput, setFormInput] = useState(null);

    //refs
    const imageListRef = useRef(imageList);
    const videoListRef = useRef(videoList);

    // check the input url for data. create new image/video lists or add to existing
    const submitInputUrl = async (userInput) => {
        try {
            // get url type and set media lists according to url
            let urlType = matchPattern(userInput, KNOWN_LINK_PATTERNS);
            setMediaListsByUrl(urlType, userInput);

            // set assistant state to reflect media lists
            dispatch(setMediaLists(imageListRef.current, videoListRef.current))
            dispatch(setInputUrl(userInput));

            // if only one image/video exists, set this to be processed with an intermediate step
            handleOneMediaListResult();
        }
        catch (error) {
            dispatch(setError(error.message));
        }
    }

    // if there is only one image/video, set this to be processed
    const handleOneMediaListResult = () => {
        if (imageListRef.current.length == 1 && videoListRef.current.length==0) {
            dispatch(setProcessUrl(imageListRef.current[0]))}
        else if(videoListRef.current.length == 1 && imageListRef.current.length==0){
            dispatch(setProcessUrl(videoListRef.current[0]))}
    }

    // handle specific urls in specific ways to pupulate image/video lists
    const setMediaListsByUrl = (urlType, userInput) => {
        switch(urlType) {
            case KNOWN_LINKS.YOUTUBE:
            case KNOWN_LINKS.LIVELEAK:
            case KNOWN_LINKS.VIMEO:
            case KNOWN_LINKS.DAILYMOTION:
                videoListRef.current = [userInput];
                break;
            case KNOWN_LINKS.TIKTOK:
                checkForMediaLists(userInput);
                imageListRef.current = [];
                break;
            case KNOWN_LINKS.INSTAGRAM:
                checkForMediaLists(userInput);
                if(videoListRef.current.length == 1){imageListRef.current = []}
                else {imageListRef.current = imageListRef.current.length>0 ?  [imageListRef.current[1]] : []}
                dispatch(setHelpMessage("assistant_handled_site"))
                break;
            case KNOWN_LINKS.FACEBOOK:
                checkForMediaLists(userInput);
                dispatch(setHelpMessage("assistant_handled_site"))
                break;
            case KNOWN_LINKS.TWITTER:
                checkForMediaLists(userInput);
                dispatch(setHelpMessage("assistant_handled_site"))
                break;
            case KNOWN_LINKS.MISC:
                let contentType = matchPattern(userInput, TYPE_PATTERNS);
                if(contentType!=null) {
                    if (contentType == CONTENT_TYPE.IMAGE) imageListRef.current = [userInput];
                    else if (contentType == CONTENT_TYPE.VIDEO) videoListRef.current = [userInput];
                }
                else{checkForMediaLists();}
                break;
            default:
                throw new Error(keyword("please_give_a_correct_link"));
        }

    }

    // if the user wants to upload a file, give them tools where this is an option
    const submitUpload = (contentType) => {
        let known_link = KNOWN_LINKS.OWN;
        let actions = selectCorrectActions(contentType, known_link, known_link, "");
        dispatch(setProcessUrlActions(contentType, actions));
        dispatch(setImageVideoSelected(true));
    }

    // select the correct media to process, then load actions possible
    const submitMediaToProcess = (url) => {
        dispatch(setProcessUrl(url));
    }

    // load possible actions for selected media url
    const loadProcessUrlActions = () => {
        let contentType = null;

        if(imageListRef.current.includes(processUrl)) {contentType = CONTENT_TYPE.IMAGE}
        else if (videoListRef.current.includes(processUrl)) {contentType = CONTENT_TYPE.VIDEO};

        let knownInputLink = matchPattern(inputUrl, KNOWN_LINK_PATTERNS);
        let knownProcessLink = matchPattern(processUrl, KNOWN_LINK_PATTERNS);
        let actions = selectCorrectActions(contentType, knownInputLink, knownProcessLink, processUrl);

        dispatch(setProcessUrlActions(contentType, actions))
    }

    // check if the browser has any stored media lists. these are generated by popup.js.
    const checkForMediaLists = () => {

        let urlImageList = window.localStorage.getItem("imageList");
        let urlVideoList = window.localStorage.getItem("videoList");

        if (urlImageList == null && urlVideoList == null) {return;}
        else if (urlImageList != "" || urlVideoList != "") {
            imageListRef.current = urlImageList != "" ? urlImageList.split(",") : [];
            videoListRef.current = urlVideoList != "" ? urlVideoList.split(",") : [];
        }
    }

    // clean assistant state
    const cleanAssistant = () => {

        //clean stored browser vars and refs
        window.localStorage.removeItem("imageList");
        window.localStorage.removeItem("videoList");
        imageListRef.current = [];
        videoListRef.current = [];

        //clean state and input
        dispatch(cleanAssistantState());
        setFormInput("");
    }

    useEffect(() => {
        if (url !== undefined) {
            let uri = ( url!== null) ? decodeURIComponent(url) : undefined;
            dispatch(setUrlMode(true));
            submitInputUrl(uri);
            history.push("/app/assistant/");
        }
    }, [url])

    useEffect(() => {
        setFormInput(inputUrl)
    },[inputUrl])

    useEffect(() => {
        if (processUrl!=null){loadProcessUrlActions();}
    }, [processUrl]);

    return (
        <Paper className = {classes.root}>
            <CustomTile text={keyword("assistant_title")}/>
            <Box m={3}/>

            <Grid container spacing={2}>
                <Grid item xs = {12} className={classes.newAssistantGrid}  hidden={urlMode!=null}>
                    <Typography component={"span"} variant={"h6"} >
                        <FaceIcon fontSize={"small"}/> {keyword("assistant_real_intro")}
                    </Typography>
                    <Box m={2}/>
                    <Button className={classes.button} variant = "contained" color="primary" onClick={() =>dispatch(setUrlMode(true))}>
                        {keyword("process_url") || ""}
                    </Button>
                    <Button className={classes.button} variant="contained" color="primary"  onClick={() => dispatch(setUrlMode(false))}>
                        {keyword("submit_own_file") || ""}
                    </Button>
                </Grid>


                <Grid item xs = {12} className={classes.newAssistantGrid}  hidden={urlMode==null || urlMode==false}>
                    <Box m={5}/>
                    <CloseResult hidden={urlMode==null || urlMode==false} onClick={() => cleanAssistant()}/>

                    <Typography component={"span"} variant={"h6"} >
                        <FaceIcon fontSize={"small"}/> {keyword("assistant_intro")}
                    </Typography>

                    <Box m={2}/>
                    <TextField
                        id="standard-full-width"
                        variant="outlined"
                        label={keyword("assistant_urlbox")}
                        style={{margin: 8}}
                        placeholder={""}
                        fullWidth
                        value={formInput || ""}
                        onChange={e => setFormInput(e.target.value)}
                    />

                    <Box m={2}/>
                    <Button variant="contained" color="primary"
                            align={"center"} onClick={() => {submitInputUrl(formInput)}}>
                        {keyword("button_submit") || ""}
                    </Button>
                </Grid>

                <Grid container spacing={2}>
                    <Grid item xs = {12}
                          className={classes.newAssistantGrid}
                          hidden={imageList.length<=1 && videoList.length<=1}>
                        <Box m={5}/>
                        <Typography component={"span"} variant={"h6"} >
                            <FaceIcon fontSize={"small"}/> {keyword("media_below")}
                        </Typography>
                    </Grid>

                    <Grid item xs = {6}
                          className={classes.newAssistantGrid}
                          hidden={(imageList.length==0 )||(imageList.length<=1 && videoList.length<=1)}>
                        <Card>
                            <Typography component={"span"} className={classes.twitterHeading}>
                                <ImageIcon className={classes.twitterIcon}/> {keyword("images_label")}
                                <Divider variant={"middle"}/>
                            </Typography>
                            <Box m={2}/>
                            <ImageGridList list={imageList} height={60} cols={5}
                                           handleClick={(event)=>{submitMediaToProcess(event.target.src)}}/>
                        </Card>
                    </Grid>

                    <Grid item xs = {6}
                          className={classes.newAssistantGrid}
                          hidden={(videoList.length==0 )||(imageList.length<=1 && videoList.length<=1)}>
                        <Card>
                            <Typography component={"span"} className={classes.twitterHeading}>
                                <DuoIcon className={classes.twitterIcon}/> {keyword("videos_label")}
                                <Divider variant={"middle"}/>
                            </Typography>
                            <Box m={2}/>
                            <VideoGridList list={videoList} handleClick={(vidLink)=>{submitMediaToProcess(vidLink)}}/>
                        </Card>
                    </Grid>

                    <Grid item xs={12}
                          hidden={inputUrl==null||(inputUrl!=null && imageList.length!=0 || videoList.length!=0)}>
                        <Card><CardContent className={classes.assistantText}>
                            <Typography variant={"h6"} align={"left"}>
                                <FaceIcon size={"small"}/> {keyword("assistant_error")}
                            </Typography>
                            <Typography variant={"h6"} align={"left"}>
                                {keyword(helpMessage)}
                            </Typography>
                        </CardContent></Card>
                    </Grid>

                </Grid>

                <Grid item xs = {12} className={classes.newAssistantGrid}  hidden={urlMode==null || urlMode==true}>
                    <Box m={5}/>
                    <CloseResult hidden={urlMode==null || urlMode==false} onClick={() => dispatch(cleanAssistantState())}/>
                    <Typography component={"span"} variant={"h6"} >
                        <FaceIcon fontSize={"small"}/> {keyword("upload_type_question")}
                    </Typography>
                    <Box m={2}/>
                    <Button className={classes.button} variant="contained" color="primary" onClick={()=>{submitUpload(CONTENT_TYPE.VIDEO)}}>
                        {keyword("upload_video") || ""}
                    </Button>
                    <Button className={classes.button} variant="contained" color="primary" onClick={()=>{submitUpload(CONTENT_TYPE.IMAGE)}}>
                        {keyword("upload_image") || ""}
                    </Button>
                </Grid>

                <Grid item xs={12}>
                    {processUrlActions.length!=0 || imageVideoSelected == true ?  <AssistantResult/> : null}
                </Grid>
            </Grid>
        </Paper>
    )

};

export default Assistant;