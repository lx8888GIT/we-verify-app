import React from "react";
import {useSelector} from "react-redux";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import makeStyles from "@material-ui/core/styles/makeStyles";
import Divider from "@material-ui/core/Divider";
import Box from "@material-ui/core/Box";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TableHead from "@material-ui/core/TableHead";
import GridList from "@material-ui/core/GridList";
import GridListTile from "@material-ui/core/GridListTile";
import Button from "@material-ui/core/Button";
import ImageReverseSearch from "../../ImageReverseSearch";

const useStyles = makeStyles(theme => ({
    root: {
        padding: theme.spacing(3, 2),
        marginTop: 5,
        textAlign: "center",
    },
    text: {
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    secondaryHeading: {
        fontSize: theme.typography.pxToRem(15),
        color: theme.palette.text.secondary,
    }, gridList: {
        width: 500,
        height: 450,
    },
    imagesRoot: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
    },
    button: {
        margin: theme.spacing(1),
    }
}));

const YoutubeResults = (props) => {
    const classes = useStyles();
    const dictionary = useSelector(state => state.dictionary);
    const lang = useSelector(state => state.language);
    const keyword = (key) => {
        return (dictionary !== null) ? dictionary[lang][key] : "";
    };

    const [expanded, setExpanded] = React.useState(false);

    const handleChange = panel => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const report = props.report;

    const verificationComments = report["verification_comments"];
    const thumbnails = (report["thumbnails"]["others"]);

    const reverseSearch = (website) => {
        for (let image of thumbnails) {
            ImageReverseSearch(website, image.url);
        }
    };

    return (
        <div>
            {
                report !== null && report["thumbnails"] !== undefined &&
                report["thumbnails"]["preferred"]["url"] &&
                <Paper className={classes.root}>
                    <Typography variant={"h5"}>
                        {report["video"]["title"]}
                    </Typography>
                    <Typography variant={"subtitle1"}>
                        {report["video"]["publishedAt"]}
                    </Typography>
                    <img
                        src={report["thumbnails"]["preferred"]["url"]}
                        title={report["video"]["title"]}
                        alt={"img"}
                    />
                    <Box m={2}/>
                    <Divider/>
                    <Box m={2}/>
                    <Typography variant={"h6"}>
                        {keyword("youtube_video_name1_2")}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p" className={classes.text}>
                        {
                            report["video"]["description"]
                        }
                    </Typography>
                    <Box m={2}/>
                    <Divider/>
                    {
                        report["video"] &&
                        <Table className={classes.table} size="small" aria-label="a dense table">
                            <TableBody>
                                {
                                    report["video"]["viewCount"] &&
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            {keyword("youtube_video_name2_1")}
                                        </TableCell>
                                        <TableCell align="right">{report["video"]["viewCount"]}</TableCell>
                                    </TableRow>
                                }
                                {
                                    report["video"]["likeCount"] &&
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            {keyword("youtube_video_name2_2")}
                                        </TableCell>
                                        <TableCell align="right">{report["video"]["likeCount"]}</TableCell>
                                    </TableRow>
                                }
                                {
                                    report["video"]["dislikeCount"] &&
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            {keyword("youtube_video_name2_3")}
                                        </TableCell>
                                        <TableCell align="right">{report["video"]["dislikeCount"]}</TableCell>
                                    </TableRow>
                                }
                                {
                                    report["video"]["duration"] &&
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            {keyword("youtube_video_name2_4")}
                                        </TableCell>
                                        <TableCell align="right">{report["video"]["duration"]}</TableCell>
                                    </TableRow>
                                }
                                {
                                    report["video"]["licensedContent"] &&
                                    <TableRow>
                                        <TableCell component="th" scope="row">
                                            {keyword("youtube_video_name2_5")}
                                        </TableCell>
                                        <TableCell align="right">{report["video"]["licensedContent"]}</TableCell>
                                    </TableRow>
                                }
                            </TableBody>
                        </Table>
                    }
                    {
                        report["source"] &&
                        <div>
                            <Box m={4}/>
                            <Typography variant={"h6"}>
                                {keyword("youtube_channel_title") + " " + report["source"]["title"]}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" component="p" className={classes.text}>
                                {
                                    report["source"]["description"]
                                }
                            </Typography>
                            <Table className={classes.table} size="small" aria-label="a dense table">
                                <TableBody>
                                    {
                                        report["source"]["publishedAt"] &&
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                {keyword("youtube_channel_name_2")}
                                            </TableCell>
                                            <TableCell align="right">{report["source"]["publishedAt"]}</TableCell>
                                        </TableRow>
                                    }
                                    {
                                        report["source"]["viewCount"] &&
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                {keyword("youtube_channel_name_3")}
                                            </TableCell>
                                            <TableCell align="right">{report["source"]["viewCount"]}</TableCell>
                                        </TableRow>
                                    }
                                    {
                                        report["source"]["url"] &&
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                {keyword("youtube_channel_name_4")}
                                            </TableCell>
                                            <TableCell align="right"><a
                                                href={report["source"]["url"]}
                                                rel="noopener noreferrer"
                                                target="_blank">{report["source"]["url"]}</a></TableCell>
                                        </TableRow>
                                    }
                                    {
                                        report["source"]["subscriberCount"] &&
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                {"comments count (add to tsv)"}
                                            </TableCell>
                                            <TableCell align="right">{report["source"]["subscriberCount"]}</TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                        </div>
                    }
                    {
                        report["verification_comments"] &&
                        <div>
                            <Box m={4}/>
                            <Typography variant={"h6"}>
                                {keyword("youtube_comment_title")}
                            </Typography>
                            <Box m={2}/>
                            <Table className={classes.table} size="small" aria-label="a dense table">
                                <TableBody>
                                    {
                                        report["pagination"]["total_comments"] &&
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                {keyword("youtube_comment_name_1")}
                                            </TableCell>
                                            <TableCell
                                                align="right">{report["pagination"]["total_comments"]}</TableCell>
                                        </TableRow>
                                    }
                                    {
                                        verificationComments !== undefined &&
                                        <TableRow>
                                            <TableCell component="th" scope="row">
                                                {keyword("youtube_comment_name_2")}
                                            </TableCell>
                                            <TableCell align="right">{verificationComments.length}</TableCell>
                                        </TableRow>
                                    }
                                </TableBody>
                            </Table>
                            <Box m={2}/>
                            {
                                <ExpansionPanel expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                                    <ExpansionPanelSummary
                                        expandIcon={<ExpandMoreIcon/>}
                                        aria-controls="panel1bh-content"
                                        id="panel1bh-header"
                                    >
                                        <Typography className={classes.heading}>{keyword("api_comments")}</Typography>
                                        <Typography className={classes.secondaryHeading}> ...</Typography>
                                    </ExpansionPanelSummary>
                                    <ExpansionPanelDetails>
                                        <Table className={classes.table} size="small" aria-label="a dense table">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>{keyword("twitter_user_title")}</TableCell>
                                                    <TableCell
                                                        align="right">{keyword("twitter_user_name_13")}</TableCell>
                                                    <TableCell
                                                        align="right">{keyword("twitter_user_name_5")}</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {
                                                    verificationComments.map((comment, key) => {
                                                        return (
                                                            <TableRow key={key}>
                                                                <TableCell component="th" scope="row">
                                                                    <a href={"https://www.youtube.com/channel/" + comment["comid"]}
                                                                       rel="noopener noreferrer"
                                                                       target="_blank">{comment["authorDisplayName"]}</a>
                                                                </TableCell>
                                                                <TableCell
                                                                    align="right">{comment["publishedAt"]}
                                                                </TableCell>
                                                                <TableCell
                                                                    align="right">{comment["textDisplay"]}
                                                                </TableCell>
                                                            </TableRow>);
                                                    })
                                                }
                                            </TableBody>
                                        </Table>
                                    </ExpansionPanelDetails>
                                </ExpansionPanel>
                            }
                        </div>
                    }
                    <Box m={4}/>
                    {
                        thumbnails !== undefined &&
                        <div>
                            <Box m={4}/>
                            <Typography variant={"h6"}>
                                {keyword("navbar_thumbnails")}
                            </Typography>
                            <Box m={1}/>
                            <div className={classes.imagesRoot}>
                                <GridList cellHeight={160} className={classes.gridList} cols={3}>
                                    {thumbnails.map((tile, key) => (
                                        <GridListTile key={key} cols={1}>
                                            <img src={tile.url} alt={'img'}/>
                                        </GridListTile>
                                    ))}
                                </GridList>
                            </div>
                            <Box m={2}/>
                            <Button className={classes.button} variant="contained" color={"primary"}
                                    onClick={() => reverseSearch("google")}>{keyword("button_reverse_google")}</Button>
                            <Button className={classes.button} variant="contained" color={"primary"}
                                    onClick={() => reverseSearch("yandex")}>{keyword("button_reverse_yandex")}</Button>
                            <Button className={classes.button} variant="contained" color={"primary"}
                                    onClick={() => reverseSearch("tineye")}>{keyword("button_reverse_tineye")}</Button>
                            {
                                report["verification_cues"] && report["verification_cues"]["twitter_search_url"] &&
                                <Button className={classes.button} variant="contained" color={"primary"}
                                        onClick={() => window.open(report["verification_cues"]["twitter_search_url"])}>{keyword("button_reverse_twitter")}</Button>
                            }
                        </div>
                    }
                </Paper>
            }
        </div>
    );
};
export default YoutubeResults;