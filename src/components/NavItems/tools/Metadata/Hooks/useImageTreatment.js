import {useCallback, useEffect} from "react";
import EXIF from "exif-js/exif";
import {useDispatch, useSelector} from "react-redux";
import {setMetadadaResult} from "../../../../../redux/actions/tools/metadataActions";
import {setError} from "../../../../../redux/actions/errorActions";
import useLoadLanguage from "../../../../../Hooks/useLoadLanguage";
import tsv from "../../../../../LocalDictionary/components/NavItems/tools/Metadata.tsv";

const useImageTreatment = (mediaUrl) => {
    const keyword = useLoadLanguage("components/NavItems/tools/Metadata.tsv", tsv);
    const dispatch = useDispatch();

    useEffect(() => {

        function isEmpty(obj) {
            for (let key in obj) {
                if (obj.hasOwnProperty(key))
                    return false;
            }
            return true;
        }

        const handleErrors = (error) => {
            if (keyword(error) !== undefined)
                dispatch(setError(keyword(error)));
            dispatch(setError("please_give_a_correct_link"))
        };

        let imageTreatment = () => {
            let img = new Image();
            img.src = mediaUrl;
            img.onload = () => {
                EXIF.getData(img, () => {
                    let res = EXIF.getAllTags(img);
                    if (!isEmpty(res)) {
                        dispatch(setMetadadaResult(mediaUrl, res, false, false, true));
                    } else
                        handleErrors("metadata_img_error_exif");
                });
            };
            img.onerror = (error) => {
                handleErrors(error)
            };
        };

        if (mediaUrl)
            imageTreatment();
    }, [mediaUrl, keyword]);
};
export default useImageTreatment;