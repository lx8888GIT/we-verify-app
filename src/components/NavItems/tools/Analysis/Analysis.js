import React, {useEffect, useState} from "react";
import {useSelector} from "react-redux";
import {Paper} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import CustomTile from "../../../Shared/CustomTitle/CustomTitle"
import Box from "@material-ui/core/Box";
import YoutubeResults from "./Results/YoutubeResults.js"
import TwitterResults from "./Results/TwitterResults";
import {useAnalysisWrapper} from "./Hooks/useAnalysisWrapper";
import useMyStyles from "../../../Shared/MaterialUiStyles/useMyStyles"
import {useParams} from 'react-router-dom'
import Iframe from "react-iframe";
import useFacebookHandler from "./Hooks/useFacebookHandler";
import FacebookResults from "./Results/FacebookResults";
import useLoadLanguage from "../../../../Hooks/useLoadLanguage";
import tsv from "../../../../LocalDictionary/components/NavItems/tools/Analysis.tsv";

const Analysis = () => {
    const {url} = useParams();
    const classes = useMyStyles();
    const keyword = useLoadLanguage("components/NavItems/tools/Analysis.tsv", tsv);

    const resultUrl = useSelector(state => state.analysis.url);
    const resultData = useSelector(state => state.analysis.result);
    const isLoading = useSelector(state => state.analysis.loading);

    const [input, setInput] = useState((resultUrl) ? resultUrl : "");
    const [submittedUrl, setSubmittedUrl] = useState(undefined);
    const [reprocess, setReprocess] = useState(false);
    const reprocessToggle = () => {
        setReprocess(!reprocess);
    };

    const [finalUrl, facebookToken, showFacebookIframe] = useFacebookHandler(submittedUrl);
    useAnalysisWrapper(finalUrl, reprocess, facebookToken);

    const submitForm = () => {
        setSubmittedUrl(input);
    };
    useEffect(() => {
        if (url !== undefined) {
            const uri = decodeURIComponent(url);
            setInput(uri);
            setSubmittedUrl(uri);
        }
    }, [url]);

    useEffect(() => {
        //setSubmittedUrl(undefined);
    }, [submittedUrl]);

    return (
        <div>
            <Paper className={classes.root}>
                <CustomTile>{keyword("api_title")} </CustomTile>
                <br/>
                <TextField
                    id="standard-full-width"
                    label={keyword("api_input")}
                    placeholder="URL"
                    fullWidth
                    disabled={isLoading}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
                <Box m={2}/>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={reprocess}
                            onChange={reprocessToggle}
                            disabled={isLoading}
                            value="checkedBox"
                            color="primary"
                        />
                    }
                    label={keyword("api_repro")}
                />
                <Button
                    variant="contained"
                    color="primary"
                    disabled={isLoading}
                    onClick={submitForm}
                >
                    {keyword("button_submit")}
                </Button>
                <Box m={1}/>
                <LinearProgress hidden={!isLoading}/>
            </Paper>
            {
                showFacebookIframe &&
                <Box m={4}>
                    <Iframe
                        frameBorder="0"
                        url={"https://caa.iti.gr/plugin_login_fb"}
                        allow="fullscreen"
                        height="400"
                        width="100%"
                    />
                </Box>
            }
            {
                (resultData !== null && resultUrl != null && resultUrl.startsWith("https://www.youtube.com/")) ?
                    <YoutubeResults report={resultData}/> : null
            }
            {
                (resultData !== null && resultUrl != null && resultUrl.startsWith("https://twitter.com/")) ?
                    <TwitterResults report={resultData}/> : null
            }
            {
                (resultData !== null && resultUrl != null && resultUrl.startsWith("https://www.facebook.com/")) ?
                    <FacebookResults report={resultData}/> : null
            }
        </div>);
};
export default Analysis;