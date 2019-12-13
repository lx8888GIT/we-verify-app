import useMyStyles from "../../../../Shared/MaterialUiStyles/useMyStyles";
import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {Paper} from "@material-ui/core";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Plot from "react-plotly.js";
import Box from "@material-ui/core/Box";
import CustomTable from "../../../../Shared/CustomTable/CustomTable";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import LinkIcon from '@material-ui/icons/Link';
import CloseResult from "../../../../Shared/CloseResult/CloseResult";
import {cleanTwitterSnaState} from "../../../../../redux/actions/tools/twitterSnaActions";
import ReactWordcloud from "react-wordcloud";
import { select } from 'd3-selection';
import useLoadLanguage from "../../../../../Hooks/useLoadLanguage";
import tsv from "../../../../../LocalDictionary/components/NavItems/tools/TwitterSna.tsv";

export default function TwitterSnaResult(props) {

    const classes = useMyStyles();
    const keyword = useLoadLanguage("components/NavItems/tools/TwitterSna.tsv", tsv);

    const dispatch = useDispatch();

    const [histoVisible, setHistoVisible] = useState(true);
    const [result, setResult] = useState(null);

    const [histoTweets, setHistoTweets] = useState(null);
    const [cloudTweets, setCloudTweets] = useState(null);
    const [pieCharts0, setPieCharts0] = useState(null);
    const [pieCharts1, setPieCharts1] = useState(null);
    const [pieCharts2, setPieCharts2] = useState(null);
    const [pieCharts3, setPieCharts3] = useState(null);

    const hidePieChartTweetsView = (index) => {
        switch (index) {
            case 0:
                setPieCharts0(null);
                break;
            case 1:
                setPieCharts1(null);
                break;
            case 2:
                setPieCharts2(null);
                break;
            case 3:
                setPieCharts3(null);
                break;
            default:
                break;
        }
    };
    const pieCharts = [pieCharts0, pieCharts1, pieCharts2, pieCharts3];


    useEffect(() => {
        setResult(props.result);
        
    }, [JSON.stringify(props.result), props.result]);

    useEffect(() => {
        setHistoTweets(null);
        setCloudTweets(null);
        setPieCharts0(null);
        setPieCharts1(null);
        setPieCharts2(null);
        setPieCharts3(null);
    }, [JSON.stringify(props.request), props.request])

    if (result === null)
        return <div/>;

    const downloadClick = (csvArr, name, histo) => {
        let encodedUri = encodeURI(csvArr);
        let link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "tweets_" + props.request.keywordList.join('&') + '_'  + name + ((!histo)?(props.request.from + "_" + props.request.until):"") + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    function isInRange(pointDate, objDate, isDays) {
        if (!isDays)
            return ((((pointDate.getDate() === objDate.getDate()
                && (pointDate.getHours() >= objDate.getHours() - 2 && pointDate.getHours() <= objDate.getHours() + 2)))
                || (pointDate.getDate() === objDate.getDate() + 1 && objDate.getHours() >= 22 && pointDate.getHours() <= 2))
                && pointDate.getMonth() === objDate.getMonth()
                && pointDate.getFullYear() === objDate.getFullYear());
        else
            return (pointDate.getDate() === objDate.getDate()
                && pointDate.getMonth() === objDate.getMonth()
                && pointDate.getFullYear() === objDate.getFullYear());
    }

    const onHistogramClick = (data) => {
        let columns = [
            {title: keyword('sna_result_username'), field: 'username'},
            {title: keyword('sna_result_date'), field: 'date'},
            {title: keyword('sna_result_tweet'), field: 'tweet'},
            {title: keyword('sna_result_retweet_nb'), field: 'retweetNb'},
        ];

        let resData = [];
        let minDate;
        let maxDate;
        let csvArr = "data:text/csv;charset=utf-8,Username,Date,Tweet,Nb of retweets\n";
        let isDays = (((new Date(data.points[0].data.x[0])).getDate() - (new Date(data.points[0].data.x[1])).getDate()) !== 0);
        let i = 0;
        data.points.forEach(point => {
            let pointDate = new Date(point.x);
            result.tweets.forEach(tweetObj => {
                if (tweetObj._source.username === point.data.name) {
                    let objDate = new Date(tweetObj._source.date);
                    if (isInRange(pointDate, objDate, isDays)) {
                        if (minDate === undefined)
                            minDate = objDate;
                        if (maxDate === undefined)
                            maxDate = objDate;
                        let date = new Date(tweetObj._source.date);
                        resData.push(
                            {
                                username: <a href={"https://twitter.com/" + point.data.name}
                                             target="_blank">{point.data.name}</a>,
                                date: date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes(),
                                tweet: tweetObj._source.tweet,
                                retweetNb: tweetObj._source.nretweets,
                            }
                        );
                        csvArr += point.data.name + ',' +
                        date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + '_' + date.getHours() + 'h' + date.getMinutes() + ',"' +
                        tweetObj._source.tweet + '",' + tweetObj._source.nretweets + '\n';


                        if (minDate > objDate) {
                            minDate = objDate
                        }
                        if (maxDate < objDate) {
                            maxDate = objDate;
                        }
                    }
                }
            });
            i++;
        });
        setHistoTweets({
            data: resData,
            columns: columns,
            csvArr: csvArr,
        });
    };

    function displayTweetsOfWord(word, callback) {
        let columns = [
            {title: keyword('sna_result_username'), field: 'username'},
            {title: keyword('sna_result_date'), field: 'date'},
            {title: keyword('sna_result_tweet'), field: 'tweet'},
            {title: keyword('sna_result_retweet_nb'), field: 'retweetNb'},
            {title: keyword('sna_result_like_nb'), field: 'likeNb'}
        ];
        let csvArr = "data:text/csv;charset=utf-8,";
    
        word = word.replace(/_/g, " ");
        let resData = [];
        csvArr += keyword('sna_result_username') + "," +
                keyword('sna_result_date') + "," +
                keyword('sna_result_tweet') + "," +
                keyword('sna_result_retweet_nb') + "," +
                keyword('sna_result_like_nb') + "\n";

        result.tweets.forEach(tweetObj => {
            if (tweetObj._source.tweet.toLowerCase().match(new RegExp('(^|((.)*[\.\(\)0-9\!\?\'\’\‘\"\:\,\/\\\%\>\<\«\»\ ^#]))' + word + '(([\.\(\)\!\?\'\’\‘\"\:\,\/\>\<\«\»\ ](.)*)|$)', "i"))) {
                
            var date = new Date(tweetObj._source.date);
                let tmpObj = {
                    username: tweetObj._source.username,
                    date: date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes(),
                    tweet: tweetObj._source.tweet,
                    retweetNb: tweetObj._source.nretweets,
                    likeNb: tweetObj._source.nlikes
                };
                resData.push(tmpObj);
                csvArr += tweetObj._source.username + ',' +
                date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ',"' +
                    tweetObj._source.tweet + '",' + tweetObj._source.nretweets + ',' + tweetObj._source.nlikes + '\n';
            }
        });
        callback({
            data: resData,
            columns: columns,
            csvArr: csvArr,
            word: word
        });
    }

    const onPieChartClick = (data, nbType, index) => {
        if (index === 3) {
            console.log("CLICKED");
           // window.open("https://twitter.com/search?q=" + data.points[0].label.replace('#', "%23"), '_blank');
           displayTweetsOfWord( data.points[0].label, setPieCharts3);
            return;
        }

        let columns = [
            {title: keyword('sna_result_username'), field: 'date'},
            {title: keyword('sna_result_tweet'), field: 'tweet'},
        ];
        let csvArr = "data:text/csv;charset=utf-8,Date,Tweet";
        if (nbType !== "retweets_cloud_chart_title") {
            columns.push({
                title: keyword('sna_result_tweet'),
                field: "nbLikes"
            });
            csvArr += ',' + keyword('sna_result_like_nb');
        }
        if (nbType !== "likes_cloud_chart_title") {
            columns.push({
                title:  keyword('sna_result_retweet_nb'),
                field: "nbReteets"
            });
            csvArr += ',' +  keyword('sna_result_retweet_nb');
        }
        csvArr += "\n";

        let resData = [];
        result.tweets.forEach(tweetObj => {
            if (tweetObj._source.username === data.points[0].label) {
                let date = new Date(tweetObj._source.date);
                let tmpObj = {
                    date: date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes(),
                    tweet: tweetObj._source.tweet,
                };
                csvArr += date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + '_' + date.getHours() + 'h' + date.getMinutes() + ',"' + tweetObj._source.tweet + '",';

                if (nbType !== "retweets_cloud_chart_title") {
                    tmpObj.nbLikes = tweetObj._source.nlikes;
                    csvArr += tmpObj.nbLikes;
                }
                if (nbType !== "likes_cloud_chart_title") {
                    tmpObj.nbReteets = tweetObj._source.nretweets;
                    csvArr += tmpObj.nbReteets;
                }
                csvArr += '\n';
                resData.push(tmpObj);
            }
        });

        let newRes = {
            data: resData,
            columns: columns,
            csvArr: csvArr,
            username: data.points[0].label
        };
        switch (index) {
            case 0:
                setPieCharts0(newRes);
                break;
            case 1:
                setPieCharts1(newRes);
                break;
            case 2:
                setPieCharts2(newRes);
                break;
            case 3:
                setPieCharts3(newRes);
                break;
            default:
                break;

        }
        
    };

    const getCallback = (callback) => {
        return function(word, event) {
          const isActive = callback !== "onWordMouseOut";
          const element = event.target;
          const text = select(element);
          text
            .on("click", () => {
              if (isActive) {
                displayTweetsOfWord(element.innerHTML, setCloudTweets)
              }
            })
            .transition()
            .attr("background", "white")
            .attr("text-decoration", isActive ? "underline" : "none");
        };
      }

    const callbacks = {
        getWordColor: word => word.color,
        getWordTooltip: word =>
            `The word "${word.text}" appears ${word.value} times and is a ${word.entity}.`,
        onWordClick: getCallback("onWordClick"),
        onWordMouseOut: getCallback("onWordMouseOut"),
        onWordMouseOver: getCallback("onWordMouseOver")
        };
    
            console.log(props.request.from);
    return (
        <Paper className={classes.root}>
            <CloseResult onClick={() => dispatch(cleanTwitterSnaState())}/>
            {
                result.histogram &&
                <ExpansionPanel expanded={histoVisible} onChange={() => setHistoVisible(!histoVisible)}>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls={"panel0a-content"}
                        id={"panel0a-header"}
                    >
                        <Typography className={classes.heading}>{keyword(result.histogram.title)}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <div style={{width: '100%',}}>
                            <Plot useResizeHandler
                                  style={{width: '100%', height: "450px"}}
                                  data={result.histogram.json}
                                  layout={result.histogram.layout}
                                  config={result.histogram.config}
                                  onClick={(e) => onHistogramClick(e)}
                                  onPurge={(a, b) => {
                                      console.log(a);
                                      console.log(b);
                                  }}
                            />
                            <Box m={2}/>
                            {
                                histoTweets &&
                                <div>
                                    <Grid container justify="space-between" spacing={2}
                                          alignContent={"center"}>
                                        <Grid item>
                                            <Button
                                                variant={"contained"}
                                                color={"secondary"}
                                                onClick={() => setHistoTweets(null)}
                                            >
                                                {
                                                    keyword('sna_result_hide')
                                                }
                                            </Button>
                                        </Grid>
                                        <Grid item>
                                            <Button
                                                variant={"contained"}
                                                color={"primary"}
                                                onClick={() => downloadClick(histoTweets.csvArr, histoTweets.data[0].date.split(' ')[0], true)}>
                                                {
                                                    keyword('sna_result_download')
                                                }
                                            </Button>
                                        </Grid>
                                    </Grid>
                                    <Box m={2}/>
                                    <CustomTable
                                        title={keyword("sna_result_slected_tweets")}
                                        colums={histoTweets.columns}
                                        data={histoTweets.data}
                                        actions={[]}
                                    />
                                </div>
                            }
                        </div>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            }
            <ExpansionPanel>
                <ExpansionPanelSummary
                    expandIcon={<ExpandMoreIcon/>}
                    aria-controls={"panel0a-content"}
                    id={"panel0a-header"}
                >
                    <Typography className={classes.heading}>{keyword("tweetCounter_title")}</Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails>
                    <Box alignItems="center" justifyContent="center" width={"100%"}>
                        <Typography variant={"h3"}>{result.tweetCount}</Typography>
                    </Box>
                </ExpansionPanelDetails>
            </ExpansionPanel>
            {
                result.pieCharts &&
                result.pieCharts.map((obj, index) => {
                    return (
                        <ExpansionPanel key={index}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon/>}
                                aria-controls={"panel" + index + "a-content"}
                                id={"panel" + index + "a-header"}
                            >
                                <Typography className={classes.heading}>{keyword(obj.title)}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Box alignItems="center" justifyContent="center" width={"100%"}>
                                    <Plot
                                        data={obj.json}
                                        layout={obj.layout}
                                        config={obj.config}
                                        onClick={e => {
                                            onPieChartClick(e, obj.title, index)
                                        }}
                                    />
                                    {
                                        pieCharts[index] &&
                                        <div>
                                            <Grid container justify="space-between" spacing={2}
                                                  alignContent={"center"}>
                                                <Grid item>
                                                    <Button
                                                        variant={"contained"}
                                                        color={"secondary"}
                                                        onClick={() => hidePieChartTweetsView(index)}>
                                                        {
                                                            keyword('sna_result_hide')
                                                        }
                                                    </Button>
                                                </Grid>
                                                <Grid item>
                                                    <Button
                                                        variant={"contained"}
                                                        color={"primary"}
                                                        onClick={() => downloadClick(pieCharts[index].csvArr, (index < 3)?pieCharts[index].username:pieCharts3.word)}>
                                                        {
                                                            keyword('sna_result_download')
                                                        }
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                            <Box m={2}/>
                                            <CustomTable title={keyword("sna_result_slected_tweets")}
                                                         colums={pieCharts[index].columns}
                                                         data={pieCharts[index].data}
                                                         ations={pieCharts[index].actions}
                                            />
                                        </div>
                                    }
                                </Box>
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    )
                })
            }
            {
                result && result.cloudChart &&
              <ExpansionPanel>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon/>}
                        aria-controls={"panel0a-content"}
                        id={"panel0a-header"}
                    >
                        <Typography className={classes.heading}>{keyword(result.cloudChart.title)}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Box alignItems="center" justifyContent="center" width={"100%"}>
                            <div width={"100%"} > 
                                <ReactWordcloud options={result.cloudChart.options} callbacks={callbacks} words={result.cloudChart.json} />
                            </div>
                            <Box m={2}/>
                                {
                                    cloudTweets &&
                                    <div>
                                        <Grid container justify="space-between" spacing={2}
                                            alignContent={"center"}>
                                            <Grid item>
                                                <Button
                                                    variant={"contained"}
                                                    color={"secondary"}
                                                    onClick={() => setCloudTweets(null)}
                                                >
                                                    {
                                                        keyword('sna_result_hide')
                                                    }
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant={"contained"}
                                                    color={"primary"}
                                                    onClick={() => downloadClick(cloudTweets.csvArr, cloudTweets.word)}>
                                                    {
                                                        keyword('sna_result_download')
                                                    }
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Box m={2}/>
                                        <CustomTable
                                            title={keyword("sna_result_slected_tweets")}
                                            colums={cloudTweets.columns}
                                            data={cloudTweets.data}
                                            actions={[]}
                                        />
                                    </div>
                                }
                            </Box>
                    </ExpansionPanelDetails>

                </ExpansionPanel>
            }
            <Box m={3}/>
            {
                result.urls &&
                <CustomTable
                    title={keyword("sna_result_url_in_tweets")}
                    colums={result.urls.columns}
                    data={result.urls.data}
                    actions={[
                        {
                            icon: LinkIcon,
                            tooltip: keyword("sna_result_go_to"),
                            onClick: (event, rowData) => {
                                window.open(rowData.url, '_blank');
                            }
                        }
                    ]}
                />
            }
        </Paper>
    );
};