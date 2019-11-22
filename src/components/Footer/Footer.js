import {Box} from "@material-ui/core";
import React from "react";
import useMyStyles from "../utility/MaterialUiStyles/useMyStyles";
import {useSelector} from "react-redux";
import Typography from "@material-ui/core/Typography";


const Footer = (props) => {
    const classes = useMyStyles();
    const dictionary = useSelector(state => state.dictionary);
    const lang = useSelector(state => state.language);
    const keyword = (key) => {
        return (dictionary !== null) ? dictionary[lang][key] : "";
    };

    return (
        <div className={classes.footer}>
            <div className={"content"} dangerouslySetInnerHTML={{__html: keyword(props.content)}}/>
        </div>
    )
};
export default Footer;