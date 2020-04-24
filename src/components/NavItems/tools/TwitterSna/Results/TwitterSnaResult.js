import useMyStyles from "../../../../Shared/MaterialUiStyles/useMyStyles";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState, useCallback } from "react";
import { Paper } from "@material-ui/core";
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
import TwitterIcon from '@material-ui/icons/Twitter';
import { TableContainer, Table, TableBody, TableRow, TableCell } from '@material-ui/core';
import { Avatar } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import CloseResult from "../../../../Shared/CloseResult/CloseResult";
import { cleanTwitterSnaState } from "../../../../../redux/actions/tools/twitterSnaActions";
import ReactWordcloud from "react-wordcloud";
import { select } from 'd3-selection';
import useLoadLanguage from "../../../../../Hooks/useLoadLanguage";
import tsv from "../../../../../LocalDictionary/components/NavItems/tools/TwitterSna.tsv";
import { saveSvgAsPng } from 'save-svg-as-png';
import { CSVLink } from "react-csv";
import Cytoscape from 'cytoscape';
import Fcose from 'cytoscape-fcose';
import { Sigma, RandomizeNodePositions, ForceAtlas2, RelativeSize } from 'react-sigma';

import CircularProgress from "@material-ui/core/CircularProgress";

Cytoscape.use(Fcose);

export default function TwitterSnaResult(props) {

    const classes = useMyStyles();
    const keyword = useLoadLanguage("components/NavItems/tools/TwitterSna.tsv", tsv);

    const dispatch = useDispatch();

    const [histoVisible, setHistoVisible] = useState(true);
    const [result, setResult] = useState(null);
    const [CSVheaders, setCSVheaders] = useState([{ label: keyword('sna_result_word'), key: "word" }, { label: keyword("sna_result_nb_occ"), key: "nb_occ" }, { label: keyword("sna_result_entity"), key: "entity" }]);
    const [filesNames, setfilesNames] = useState(null);

    const [histoTweets, setHistoTweets] = useState(null);
    const [cloudTweets, setCloudTweets] = useState(null);
    const [heatMapTweets, setheatMapTweets] = useState(null);
    const [pieCharts0, setPieCharts0] = useState(null);
    const [pieCharts1, setPieCharts1] = useState(null);
    const [pieCharts2, setPieCharts2] = useState(null);
    const [pieCharts3, setPieCharts3] = useState(null);
    const [graphReset, setGraphReset] = useState(null);
    const [graphClickNode, setGraphClickNode] = useState(null);
    const [graphTweets, setGraphTweets] = useState(null);
    const [graphInteraction, setGraphInteraction] = useState(null);

    const hideTweetsView = (index) => {
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
            case 4:
                setGraphTweets(null);
                break;
            default:
                break;
        }
    };

    const pieCharts = [pieCharts0, pieCharts1, pieCharts2, pieCharts3];

    //Set the file name for wordsCloud export
    useEffect(() => {
        setfilesNames('WordCloud_' + props.request.keywordList.join("&") + "_" + props.request.from + "_" + props.request.until);
    }, [JSON.stringify(props.request), props.request]);

    //Set result 
    useEffect(() => {

        setResult(props.result);

    }, [JSON.stringify(props.result), props.result]);

    //Initialize tweets arrays
    useEffect(() => {
        setHistoTweets(null);
        setCloudTweets(null);
        setheatMapTweets(null);
        setPieCharts0(null);
        setPieCharts1(null);
        setPieCharts2(null);
        setPieCharts3(null);
        setGraphReset(null);
        setGraphClickNode(null);
        setGraphTweets(null);
        setGraphInteraction(null);
    }, [JSON.stringify(props.request), props.request])


    const displayTweetsOfWord = (word, callback) => {

        let columns = [
            { title: keyword('sna_result_username'), field: 'username' },
            { title: keyword('sna_result_date'), field: 'date' },
            { title: keyword('sna_result_tweet'), field: 'tweet', render: getTweetWithClickableLink },
            { title: keyword('sna_result_retweet_nb'), field: 'retweetNb' },
            { title: keyword('sna_result_like_nb'), field: 'likeNb' }
        ];
        let csvArr = "";


        // word = word.replace(/_/g, " ");
        let resData = [];
        csvArr += keyword('sna_result_username') + "," +
            keyword('sna_result_date') + "," +
            keyword('sna_result_tweet') + "," +
            keyword('sna_result_retweet_nb') + "," +
            keyword('sna_result_like_nb') + "," +
            keyword('elastic_url') + "\n";


        result.tweets.forEach(tweetObj => {

            if (tweetObj._source.tweet.toLowerCase().match(new RegExp('(^|((.)*[\.\(\)0-9\!\?\'\’\‘\"\:\,\/\\\%\>\<\«\»\ ^#]))' + word + '(([\.\(\)\!\?\'\’\‘\"\:\,\/\>\<\«\»\ ](.)*)|$)', "i"))) {


                var date = new Date(tweetObj._source.date);
                //let tweet = getTweetWithClickableLink(tweetObj._source.tweet,tweetObj._source.link);
                let tmpObj = {
                    username: tweetObj._source.username,
                    date: date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes(),
                    tweet: tweetObj._source.tweet,
                    retweetNb: tweetObj._source.nretweets,
                    likeNb: tweetObj._source.nlikes,
                    link: tweetObj._source.link
                };
                resData.push(tmpObj);
                csvArr += tweetObj._source.username + ',' +
                    date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ',"' +
                    tweetObj._source.tweet + '",' + tweetObj._source.nretweets + ',' + tweetObj._source.nlikes + ',' + tweetObj._source.link + '\n';
            }
        });
        let tmp = {
            data: resData,
            columns: columns,
            csvArr: csvArr,
            word: word
        };

        callback(tmp);
    }

    const displayTweetsOfDate = (data, fromHisto) => {
        let columns = [
            { title: keyword('sna_result_username'), field: 'username' },
            { title: keyword('sna_result_date'), field: 'date' },
            { title: keyword('sna_result_tweet'), field: 'tweet', render: getTweetWithClickableLink },
            { title: keyword('sna_result_retweet_nb'), field: 'retweetNb' },
        ];

        let resData = [];
        let minDate;
        let maxDate;
        let csvArr = keyword("sna_result_username") + "," + keyword("sna_result_date") + "," + keyword("sna_result_tweet") + "," + keyword("sna_result_retweet_nb") + "," + keyword("elastic_url") + "\n";
        let isDays = "isDays";
        if (!fromHisto) { isDays = "isHours" }

        result.tweets.forEach(tweetObj => {

            let objDate = new Date(tweetObj._source.date);
            for (let i = 0; i < data.points.length; i++) {
                let pointDate = new Date(fromHisto ? data.points[i].x : (data.points[i].x + ' ' + data.points[i].y));
                if (data.points[i].data.mode !== "lines" && isInRange(pointDate, objDate, isDays)) {
                    if (minDate === undefined)
                        minDate = objDate;
                    if (maxDate === undefined)
                        maxDate = objDate;
                    let date = new Date(tweetObj._source.date);
                    resData.push(
                        {
                            username: <a href={"https://twitter.com/" + tweetObj._source.username}
                                target="_blank">{tweetObj._source.username}</a>,
                            date: date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes(),
                            tweet: tweetObj._source.tweet,
                            retweetNb: tweetObj._source.nretweets,
                            link: tweetObj._source.link
                        }
                    );
                    csvArr += tweetObj._source.username + ',' +
                        date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + '_' + date.getHours() + 'h' + date.getMinutes() + ',"' +
                        tweetObj._source.tweet + '",' + tweetObj._source.nretweets + "," + tweetObj._source.link + '\n';


                    if (minDate > objDate) {
                        minDate = objDate
                    }
                    if (maxDate < objDate) {
                        maxDate = objDate;
                    }
                }
            }
        });
        //  i++;
        //  });
        return {
            data: resData,
            columns: columns,
            csvArr: csvArr,
        };
    };

    function getDayAsString(dayInt) {
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayInt];
        }
        
        function getHourAsString(hourInt) {
        return ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', 
                '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'][hourInt];
        }
    
    const displayTweetsOfDateHeatMap = (data) => {
        let columns = [
            { title: keyword('sna_result_username'), field: 'username' },
            { title: keyword('sna_result_date'), field: 'date' },
            { title: keyword('sna_result_tweet'), field: 'tweet', render: getTweetWithClickableLink },
            { title: keyword('sna_result_retweet_nb'), field: 'retweetNb' },
        ];
        let resData = [];
        let csvArr = keyword("sna_result_username") + ',' + keyword("sna_result_date") + ',' + keyword("sna_result_tweet") + ',' + keyword("sna_result_retweet_nb") + ',' + keyword("elastic_url") + '\n';

        const filteredTweets = result.tweets.filter(function(tweetObj) {
            const date = new Date(tweetObj._source.date);
            const day = getDayAsString(date.getDay());
            const hour = getHourAsString(date.getHours());
            return hour === data.points[0].x && day === data.points[0].y;
        });

        filteredTweets.forEach(tweetObj => {
            const date = new Date(tweetObj._source.date);
            resData.push(
                {
                    username: <a href={"https://twitter.com/" + tweetObj._source.username} target="_blank">{tweetObj._source.username}</a>,
                    date: date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes(),
                    tweet: tweetObj._source.tweet,
                    retweetNb: tweetObj._source.nretweets,
                    link: tweetObj._source.link
                }
            );
            csvArr += tweetObj._source.username + ',' +
                date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + '_' + date.getHours() + 'h' + date.getMinutes() + ',"' +
                tweetObj._source.tweet + '",' + tweetObj._source.nretweets + ',' + tweetObj._source.link + '\n';
        });

        return {
            data: resData,
            columns: columns,
            csvArr: csvArr,
        };
    };
    
    const displayTweetsOfUser = (data, nbType, index) => {
        let columns = [
            { title: keyword('sna_result_date'), field: 'date' },
            { title: keyword('sna_result_tweet'), field: 'tweet', render: getTweetWithClickableLink },
        ];
        let csvArr = keyword('sna_result_date') + "," + keyword('sna_result_tweet');
        if (nbType !== "retweets_cloud_chart_title") {
            columns.push({
                title: keyword('sna_result_like_nb'),
                field: "nbLikes"
            });
            csvArr += ',' + keyword('sna_result_like_nb');
        }
        if (nbType !== "likes_cloud_chart_title") {
            columns.push({
                title: keyword('sna_result_retweet_nb'),
                field: "nbReteets"
            });
            csvArr += ',' + keyword('sna_result_retweet_nb');
        }
        csvArr += ',' + keyword('elastic_url') + "\n";

        let resData = [];

        let selectedUser = null;
        if (index === 4) {
            selectedUser = data.data.node.id.toLowerCase();
        } else {
            selectedUser = data.points[0].label;
        }

        result.tweets.forEach(tweetObj => {
            if (tweetObj._source.username.toLowerCase() === selectedUser) {
                let date = new Date(tweetObj._source.date);
                let tmpObj = {
                    date: date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes(),
                    tweet: tweetObj._source.tweet,
                    link: tweetObj._source.link
                };
                csvArr += date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + '_' + date.getHours() + 'h' + date.getMinutes() + ',"' + tweetObj._source.tweet + '",';

                if (nbType !== "retweets_cloud_chart_title") {
                    tmpObj.nbLikes = tweetObj._source.nlikes;
                    csvArr += tmpObj.nbLikes + ',';
                }
                if (nbType !== "likes_cloud_chart_title") {
                    tmpObj.nbReteets = tweetObj._source.nretweets;
                    csvArr += tmpObj.nbReteets + ',';
                }
                csvArr += tmpObj.link + '\n';
                resData.push(tmpObj);
            }
        });


        let newRes = {
            data: resData,
            columns: columns,
            csvArr: csvArr,
            username: selectedUser
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
            case 4:
                setGraphTweets(newRes);
                break;
            default:
                break;

        }
    }

    const displayUserInteraction = (e) => {

        let columns = [
            { title: keyword('sna_result_username'), field: 'username' },
            { title: 'Interaction', field: 'nbInteraction', render: getTweetWithClickableLink },
        ];

        let interaction = result.netGraph.userInteraction.find((element) => element.username === e.data.node.id);
        let resData = [];
        let sortedInteraction = [];
        if (interaction !== undefined) {
            sortedInteraction = Object.entries(interaction.interacted).sort((a, b) => { return a[1] - b[1]; });
            sortedInteraction.forEach(x => {
                resData.push({ username: x[0], nbInteraction: x[1] });
            });
        }

        let newRes = {
            username: e.data.node.id,
            data: resData,
            columns: columns
        };
        setGraphInteraction(newRes);
    }

    function downloadClick(csvArr, name, histo) {
        let encodedUri = encodeURIComponent(csvArr);
        let link = document.createElement("a");
        link.setAttribute("href", 'data:text/plain;charset=utf-8,' + encodedUri);
        link.setAttribute("download", "tweets_" + props.request.keywordList.join('&') + '_' + name + ((!histo) ? (props.request.from + "_" + props.request.until) : "") + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function isInRange(pointDate, objDate, periode) {

        if (periode === "isHours") {
            return (((pointDate.getDate() === objDate.getDate()
                && pointDate.getHours() - 1 === objDate.getHours()))
                && pointDate.getMonth() === objDate.getMonth()
                && pointDate.getFullYear() === objDate.getFullYear());
        }
        else {
            return (pointDate - objDate) === 0;
        }
    }



    const onHistogramClick = (data) => {
        setHistoTweets(displayTweetsOfDate(data, true));
    }

    const onHeatMapClick = (data) => {
        setheatMapTweets(displayTweetsOfDateHeatMap(data, false));
    }

    const onDonutsClick = (data, nbType, index) => {

        //For hashtag donuts
        if (index === 3) {
            displayTweetsOfWord(data.points[0].label, setPieCharts3);
        }
        else {
            displayTweetsOfUser(data, nbType, index);
        }



    };
    const getTweetWithClickableLink = (cellData) => {
        let urls = cellData.tweet.match(/((http|https|ftp|ftps)\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?|pic\.twitter\.com\/([-a-zA-Z0-9()@:%_\+.~#?&//=]*))/g);
        if (urls === null)
            return cellData.tweet;

        let tweetText = cellData.tweet.split(urls[0]);
        if (urls[0].match(/pic\.twitter\.com\/([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/))
            urls[0] = "https://" + urls[0];
        let element = <div>{tweetText[0]} <a href={urls[0]} target="_blank">{urls[0]}</a>{tweetText[1]}</div>;
        return element;
    }

    let goToTweetAction = [{
        icon: TwitterIcon,
        tooltip: keyword("sna_result_go_to_tweet"),
        onClick: (event, rowData) => {
            window.open(rowData.link, '_blank');
        }
    }]


    const getCallback = useCallback((callback) => {

        return function (word, event) {

            const isActive = callback !== "onWordMouseOut";
            const element = event.target;
            const text = select(element);
            text
                .on("click", () => {
                    if (isActive) {

                        displayTweetsOfWord(word.text, setCloudTweets)
                    }
                })
                .transition()
                .attr("background", "white")
                .attr("text-decoration", isActive ? "underline" : "none");
        };
    }, [JSON.stringify(result)]);

    const tooltip = word => {
        if (word.entity !== null)
            return "The word " + word.text + " appears " + word.value + " times" + " and is a " + word.entity + ".";
        else
            return "The word " + word.text + " appears " + word.value + " times" + ".";
    }

    const getCallbacks = () => {
        return {
            getWordColor: word => word.color,
            getWordTooltip: word =>
                tooltip(word),
            onWordClick: getCallback("onWordClick"),
            onWordMouseOut: getCallback("onWordMouseOut"),
            onWordMouseOver: getCallback("onWordMouseOver")
        }
    };

    //Download as PNG
    function downloadAsPNG() {
        let svg = document.getElementById("top_words_cloud_chart");
        let name = filesNames + '.png';

        saveSvgAsPng(svg.children[0].children[0], name, { backgroundColor: "white", scale: 2 });
    }

    //Download as SVG
    function downloadAsSVG() {

        let name = filesNames + '.svg';
        var svgEl = document.getElementById("top_words_cloud_chart").children[0].children[0];
        svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        var svgData = svgEl.outerHTML;
        var preface = '<?xml version="1.0" standalone="no"?>\r\n';
        var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
        var svgUrl = URL.createObjectURL(svgBlob);
        var downloadLink = document.createElement("a");
        downloadLink.href = svgUrl;
        downloadLink.download = name;
        downloadLink.click();

    }

    function getCSVData() {
        if (!props.result.cloudChart.json)
            return "";
        let csvData = props.result.cloudChart.json.map(wordObj => { return { word: wordObj.text, nb_occ: wordObj.value, entity: wordObj.entity } });
        return csvData;
    }

    function getGraphFromScreen(e, graphData) {
        let resetGraph = {
            nodes: e.data.renderer.nodesOnScreen,
            edges: graphData.edges
        };
        return resetGraph;
    }

    function onClickNode(e, graphData) {

        // Set new graph (which has only the clicked node and its neighbors) after clicking
        setGraphClickNode(createGraphWhenClickANode(e));

        setGraphReset(getGraphFromScreen(e, graphData));

        displayTweetsOfUser(e, '', 4);

        displayUserInteraction(e);
    }

    function onClickStage(e) {
        setGraphClickNode(() => {
            return null;
        });
        hideTweetsView(4);

        setGraphInteraction(null);
    }

    function createGraphWhenClickANode(e) {

        let selectedNode = e.data.node;

        let neighborNodes = e.data.renderer.graph.adjacentNodes(selectedNode.id);
        let neighborEdges = e.data.renderer.graph.adjacentEdges(selectedNode.id);
        let directedNeighborEdges = neighborEdges.map((edge) => {
            let newEdge= JSON.parse(JSON.stringify(edge));
            if (newEdge.source !== selectedNode.id) {
                newEdge.target = edge.source;
                newEdge.source = selectedNode.id;
            }
            return newEdge;
        });

        neighborNodes.push(selectedNode);

        let newGraph = {
            nodes: neighborNodes,
            edges: directedNeighborEdges
        }

        console.log("newGraph", newGraph);
        return newGraph;
    }

    function demo() {
        return 0;
    }

    if (result === null)
        return <div />;

    let call = getCallbacks();
    return (
        <Paper className={classes.root}>
            <CloseResult onClick={() => dispatch(cleanTwitterSnaState())} />
            {
                result.histogram &&
                <ExpansionPanel expanded={histoVisible} onChange={() => setHistoVisible(!histoVisible)}>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={"panel0a-content"}
                        id={"panel0a-header"}
                    >
                        <Typography className={classes.heading}>{keyword(result.histogram.title)}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        {}
                        <div style={{ width: '100%', }}>
                            {(result.histogram.json && (result.histogram.json.length === 0) &&
                                <Typography variant={"body2"}>{keyword("sna_no_data")}</Typography>)}
                            {(result.histogram.json && result.histogram.json.length !== 0) &&
                                <Plot useResizeHandler
                                    style={{ width: '100%', height: "450px" }}
                                    data={result.histogram.json}
                                    layout={result.histogram.layout}
                                    config={result.histogram.config}
                                    onClick={(e) => onHistogramClick(e)}
                                    onPurge={(a, b) => {
                                        console.log(a);
                                        console.log(b);
                                    }}
                                />
                            }
                            <Box m={2} />
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
                                    <Box m={2} />
                                    <CustomTable
                                        title={keyword("sna_result_slected_tweets")}
                                        colums={histoTweets.columns}
                                        data={histoTweets.data}
                                        actions={goToTweetAction}
                                    />
                                </div>

                            }
                        </div>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            }

            {
                result && result.tweetCount &&
                <ExpansionPanel>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={"panel0a-content"}
                        id={"panel0a-header"}
                    >
                        <Typography className={classes.heading} >{keyword("tweetCounter_title")}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Box alignItems="center" justifyContent="center" width={"100%"}>
                            <Grid container justify="space-around" spacing={2}
                                alignContent={"center"}>
                                <Grid item>
                                    <Typography variant={"h6"}>Tweets</Typography>
                                    <Typography variant={"h2"}>{result.tweetCount.count}</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant={"h6"}>Retweets</Typography>
                                    <Typography variant={"h2"}>{result.tweetCount.retweet}</Typography>
                                </Grid>
                                <Grid item>
                                    <Typography variant={"h6"}>Likes</Typography>
                                    <Typography variant={"h2"}>{result.tweetCount.like}</Typography>
                                </Grid>
                            </Grid>

                        </Box>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            }
            {
                result.pieCharts &&
                result.pieCharts.map((obj, index) => {
                    if ((props.request.userList.length === 0 || index === 3))
                        return (
                            <ExpansionPanel key={index}>
                                <ExpansionPanelSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls={"panel" + index + "a-content"}
                                    id={"panel" + index + "a-header"}
                                >
                                    <Typography className={classes.heading}>{keyword(obj.title)}</Typography>
                                </ExpansionPanelSummary>
                                <ExpansionPanelDetails>
                                    <Box alignItems="center" justifyContent="center" width={"100%"}>
                                        {
                                            ((obj.json === null) &&
                                                <Typography variant={"body2"}>{keyword("sna_no_data")}</Typography>)
                                        }
                                        {(obj.json !== null) &&
                                            <Plot
                                                data={obj.json}
                                                layout={obj.layout}
                                                config={obj.config}
                                                onClick={e => {
                                                    onDonutsClick(e, obj.title, index)
                                                }}
                                            />
                                        }
                                        {
                                            pieCharts[index] &&
                                            <div>
                                                <Grid container justify="space-between" spacing={2}
                                                    alignContent={"center"}>
                                                    <Grid item>
                                                        <Button
                                                            variant={"contained"}
                                                            color={"secondary"}
                                                            onClick={() => hideTweetsView(index)}>
                                                            {
                                                                keyword('sna_result_hide')
                                                            }
                                                        </Button>
                                                    </Grid>
                                                    <Grid item>
                                                        <Button
                                                            variant={"contained"}
                                                            color={"primary"}
                                                            onClick={() => downloadClick(pieCharts[index].csvArr, (index < 3) ? pieCharts[index].username : pieCharts3.word)}>
                                                            {
                                                                keyword('sna_result_download')
                                                            }
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                                <Box m={2} />
                                                <CustomTable title={keyword("sna_result_slected_tweets")}
                                                    colums={pieCharts[index].columns}
                                                    data={pieCharts[index].data}
                                                    actions={goToTweetAction}
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

                <ExpansionPanel>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={"panel0a-content"}
                        id={"panel0a-header"}
                    >
                        <Typography className={classes.heading}>{keyword(result.cloudChart.title)}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        {
                            result && result.cloudChart && result.cloudChart.json &&
                            <Box alignItems="center" justifyContent="center" width={"100%"}>
                                <div height={"500"} width={"100%"} >
                                    {
                                        (result.cloudChart.json && result.cloudChart.json.length === 0) &&
                                        <Typography variant={"body2"}>{keyword("sna_no_data")}</Typography>}
                                    {(result.cloudChart.json && result.cloudChart.json.length !== 0) &&
                                        <Grid container justify="space-between" spacing={2}
                                            alignContent={"center"}>
                                            <Grid item>
                                                <Button
                                                    variant={"contained"}
                                                    color={"primary"}
                                                    onClick={() => downloadAsPNG()}>
                                                    {
                                                        keyword('sna_result_download_png')
                                                    }
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <CSVLink
                                                    data={getCSVData()} headers={CSVheaders} filename={filesNames + ".csv"} className="MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary">
                                                    {
                                                        "CSV"
                                                        // keyword('sna_result_download_csv')
                                                    }
                                                </CSVLink>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant={"contained"}
                                                    color={"primary"}
                                                    onClick={() => downloadAsSVG()}>
                                                    {
                                                        keyword('sna_result_download_svg')
                                                    }
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    }

                                </div>
                                <Box m={2} />
                                {
                                    result.cloudChart.json && (result.cloudChart.json.length !== 0) &&
                                    <div id="top_words_cloud_chart" height={"100%"} width={"100%"}>
                                        <ReactWordcloud key={JSON.stringify(result)} options={result.cloudChart.options} callbacks={call} words={result.cloudChart.json} />
                                    </div>

                                }
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
                                        <Box m={2} />
                                        <CustomTable
                                            title={keyword("sna_result_slected_tweets")}
                                            colums={cloudTweets.columns}
                                            data={cloudTweets.data}
                                            actions={goToTweetAction}
                                        />
                                    </div>
                                }
                            </Box>
                        }

                        {
                            result.cloudChart.json === undefined &&
                            <CircularProgress className={classes.circularProgress} />
                        }
                    </ExpansionPanelDetails>


                </ExpansionPanel>
            }
            {
                <ExpansionPanel>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography className={classes.heading}>{keyword('sna_result_heatMap')}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        {
                            result && result.heatMap &&
                            <Box alignItems="center" justifyContent="center" width={"100%"}>
                                {
                                    ((result.heatMap.isAllnul) &&
                                        <Typography variant={"body2"}>{keyword("sna_no_data")}</Typography>) ||

                                    <Plot
                                        style={{ width: '100%', height: "450px" }}
                                        data={result.heatMap.plot}
                                        config={result.histogram.config}
                                        onClick={(e) => onHeatMapClick(e)}
                                    />
                                }
                                {
                                    heatMapTweets &&
                                    <div>
                                        <Grid container justify="space-between" spacing={2}
                                            alignContent={"center"}>
                                            <Grid item>
                                                <Button
                                                    variant={"contained"}
                                                    color={"secondary"}
                                                    onClick={() => setheatMapTweets(null)}>
                                                    {
                                                        keyword('sna_result_hide')
                                                    }
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant={"contained"}
                                                    color={"primary"}
                                                    onClick={() => {
                                                        let date = new Date(heatMapTweets.data[0].date);
                                                        let dayHourStr = getDayAsString(date.getDay()) + date.getHours() + "h_";
                                                        downloadClick(heatMapTweets.csvArr, dayHourStr, false);
                                                    }}>
                                                    {
                                                        keyword('sna_result_download')
                                                    }
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Box m={2} />
                                        <CustomTable title={keyword("sna_result_slected_tweets")}
                                            colums={heatMapTweets.columns}
                                            data={heatMapTweets.data}
                                            actions={goToTweetAction}
                                        />
                                    </div>
                                }
                            </Box>
                        }
                        {
                            result.heatMap === undefined &&
                            (//<Typography variant='body2'>The heatmap is still loading please wait (ADD TSV)</Typography>

                                <CircularProgress className={classes.circularProgress} />)
                        }
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            }
            {
                <ExpansionPanel>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                    >
                        <Typography className={classes.heading}>{"Graph"}</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        {
                            result && result.netGraph &&
                            <div style={{ width: '100%' }}>
                                {
                                    (graphReset === null && graphClickNode === null &&
                                        result.netGraph.hashtagGraph && result.netGraph.hashtagGraph.nodes.length !== 0) &&
                                    <Sigma graph={result.netGraph.hashtagGraph}
                                        renderer={"canvas"}
                                        style={{ textAlign: 'left', width: '100%', height: '700px' }}
                                        onClickNode={(e) => onClickNode(e, result.netGraph.hashtagGraph)}
                                        settings={{
                                            labelThreshold: 13,
                                            drawEdges: false,
                                            drawEdgeLabels: false,
                                            minNodeSize: 5,
                                            maxNodeSize: 12
                                        }}>
                                        <RandomizeNodePositions>
                                            <ForceAtlas2 iterationsPerRender={1} timeout={120000} />
                                        </RandomizeNodePositions>
                                    </Sigma>
                                }
                                {graphReset !== null && graphClickNode !== null &&
                                    <Sigma graph={graphClickNode}
                                        renderer={"canvas"}
                                        onClickStage={(e) => onClickStage(e)}
                                        style={{ textAlign: 'left', width: '100%', height: '700px' }}
                                        settings={{
                                            defaultLabelColor: "#777",
                                            labelThreshold: 13,
                                            minNodeSize: 5,
                                            maxNodeSize: 12,
                                            drawEdgeLabels: true,
                                            edgeColor: 'target'
                                        }}
                                    >
                                    </Sigma>
                                }
                                {graphReset !== null && graphClickNode === null &&
                                    <Sigma graph={graphReset}
                                        renderer={"canvas"}
                                        style={{ textAlign: 'left', width: '100%', height: '700px' }}
                                        onClickNode={(e) => onClickNode(e, graphReset)}
                                        settings={{
                                            labelThreshold: 13,
                                            drawEdges: false,
                                            drawEdgeLabels: false,
                                            minNodeSize: 5,
                                            maxNodeSize: 12
                                        }}>
                                    </Sigma>
                                }
                                {
                                    result.netGraph.legend && result.netGraph.legend !== 0 && 
                                    <div >
                                        <Paper >
                                            <ListSubheader component="div" style={{ fontSize: 18, fontWeight: 'bold' }}> Legend </ListSubheader>
                                            <List className={classes.root} >
                                                {
                                                    result.netGraph.legend.map((community) => {
                                                        return (
                                                            <ListItem key={community.communityColor + (Math.random())}>
                                                            <ListItemIcon>
                                                            <div className="legendcolor" 
                                                                style={{backgroundColor:community.communityColor, width: 18, height: 18, borderRadius: '50%'}}>
                                                            </div>
                                                            </ListItemIcon>
                                                            <ListItemText primary={ community.legend } />
                                                            </ListItem>
                                                        );
                                                    })
                                                }
                                            </List>
                                        </Paper>
                                    </div>
                                }
                                {
                                    graphTweets &&
                                    <div>
                                        <Grid container justify="space-between" spacing={2}
                                            alignContent={"center"}>
                                            <Grid item>
                                                <Button
                                                    variant={"contained"}
                                                    color={"secondary"}
                                                    onClick={() => hideTweetsView(4)}>
                                                    {
                                                        keyword('sna_result_hide')
                                                    }
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant={"contained"}
                                                    color={"primary"}
                                                    onClick={() => downloadClick(graphTweets.csvArr, graphTweets.username)}>
                                                    {
                                                        keyword('sna_result_download')
                                                    }
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <Box m={2} />
                                        <CustomTable title={keyword("sna_result_slected_tweets")}
                                            colums={graphTweets.columns}
                                            data={graphTweets.data}
                                            actions={goToTweetAction}
                                        />
                                    </div>
                                }
                                {
                                    graphInteraction &&
                                    <div style={{ position: 'absolute', top: 0, right: 0 }}>
                                        <Paper style={{ width: 300 }}>
                                            <div style={{
                                                height: 65,
                                                backgroundSize: 'cover',
                                                backgroundImage: `url(${"http://abs.twimg.com/images/themes/theme1/bg.png"})`
                                            }}>
                                            </div>
                                            <div>
                                                <List style={{ position: 'absolute', top: 40, width: '100%' }}>
                                                    <ListItem>
                                                        <ListItemAvatar>
                                                            <Avatar alt={graphInteraction.username}
                                                                src={"http://avatars.io/twitter/" + graphInteraction.username}
                                                                variant='rounded'
                                                                style={{ width: 65, height: 65 }} />
                                                        </ListItemAvatar>
                                                        <ListItemText primary={graphInteraction.username}
                                                                        style={{ marginLeft: 10, color: '#428bca' }} />
                                                    </ListItem>
                                                </List>
                                            </div>
                                            <TableContainer style={{ marginTop: 60 }}>
                                                <Table size="small">
                                                    <TableBody>
                                                        <TableRow>
                                                            <TableCell colSpan={2}
                                                                align="center"
                                                                style={{ fontSize: 18, fontWeight: 'bold', borderBottom: 'none' }}
                                                                >
                                                                Mostly conntected with:
                                                        </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell colSpan={2}
                                                                align="center"
                                                                style={{ color: '#6a6a6a', borderBottom: 'none' }}>
                                                                TODO later
                                                        </TableCell>
                                                        </TableRow>
                                                        <TableRow>
                                                            <TableCell colSpan={2}
                                                                align="center"
                                                                style={{ fontSize: 18, fontWeight: 'bold', borderBottom: 'none' }}
                                                                >
                                                                Mostly interacted with:
                                                    </TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                            <List className={classes.root} style={{ overflow: 'auto', maxHeight: 150 }}>
                                            {
                                                graphInteraction.data.length !== 0  && graphInteraction.data.map((row) => {
                                                    return (
                                                        <ListItem key={row.username}>
                                                            <ListItemAvatar>
                                                                <Avatar alt={row.username}
                                                                    src={"http://avatars.io/twitter/" + row.username} />
                                                            </ListItemAvatar>
                                                            <ListItemText primary={row.username}
                                                                secondary={"Interactions: " + row.nbInteraction} />
                                                        </ListItem>
                                                    );
                                                })
                                            }
                                            {
                                                graphInteraction.data.length === 0  && "No interaction"
                                            }
                                            </List>
                                        </Paper>
                                    </div>
                                }

                            </div>
                        }
                        {
                            result.netGraph === undefined &&
                            <CircularProgress className={classes.circularProgress} />
                        }
                        
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            }
            {
                <ExpansionPanel>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls={"panel0a-content"}
                        id={"panel0a-header"}
                    >
                        <Typography className={classes.heading} >Download hashtags csv</Typography>
                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                    {
                        result && result.csvArrHashtags &&
                        <Box alignItems="center" justifyContent="center" width={"100%"}>
                            <Grid container justify="space-around" spacing={2}
                                alignContent={"center"}>
                                <Grid item>
                                        <Button
                                                variant={"contained"}
                                                color={"secondary"}
                                                onClick={() => downloadClick(result.csvArrHashtags.csvArr, result.csvArrHashtags.filename, false)}
                                            >
                                                Download
                                        </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    }
                    {
                        result.netGraph === undefined &&
                        <CircularProgress className={classes.circularProgress} />
                    }
                    </ExpansionPanelDetails>
                </ExpansionPanel>
            }

            <Box m={3} />
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