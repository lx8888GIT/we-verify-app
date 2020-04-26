import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { setError } from "../../../../redux/actions/errorActions";

import dateFormat from "dateformat";
import _ from "lodash";

import useMyStyles from "../../../Shared/MaterialUiStyles/useMyStyles";
import Paper from "@material-ui/core/Paper";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Box from "@material-ui/core/Box";

import SearchIcon from '@material-ui/icons/Search';

import CustomTile from "../../../Shared/CustomTitle/CustomTitle";
import useLoadLanguage from "../../../../Hooks/useLoadLanguage";
import tsv from "../../../../LocalDictionary/components/NavItems/tools/CovidSearch.tsv";


const CovidSearch = () => {
  const classes = useMyStyles();
  const keyword = useLoadLanguage("components/NavItems/tools/CovidSearch.tsv", tsv);
  console.log("kedddd", keyword);

  const searchEngines = [
    "https://cse.google.com/cse.js?cx=000556916517770601014:i0sxs8kmmzr",
    "https://cse.google.com/cse.js?cx=000556916517770601014:jff3t29fxeq",
    "https://cse.google.com/cse.js?cx=000556916517770601014:3imsvcumevz"
  ]

  useEffect(() => {

    searchEngines.forEach(engine => {
      const script = document.createElement('script');
      script.src = engine;
      script.async = true;
    
      document.head.appendChild(script);
    
      return () => {
        document.head.removeChild(script);
      }
    });
    
  }, []);

  return (
    <div>
      <Paper className={classes.root}>
       <CustomTile text={keyword("navbar_covidsearch")} />

        <Box m={3} />
        <div className="gcse-search"></div>
        
      </Paper>
      
    </div>);
};
export default CovidSearch;