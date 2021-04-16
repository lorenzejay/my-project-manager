import axios from "axios";
import { useEffect, useState } from "react";
import { AiOutlineClose } from "react-icons/ai";
import { useSelector } from "react-redux";
import { configWithToken } from "../functions";

const PrivacyOptions = ({
  openPrivacyOptions,
  setOpenPrivacyOptions,
  isPrivateProject,
  setIsPrivateProject,
  is_private = null,
  projectId,
}) => {
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;

  const [response, setResponse] = useState();

  useEffect(() => {
    if (projectId && is_private !== null && is_private !== undefined) {
      setIsPrivateProject(is_private);
    }
  }, [is_private]);

  //update privacy
  const handleUpdatePrivacy = async (projectIsPrivate) => {
    try {
      // console.log("is_private", is_private);
      //x console.log("isPrivateProject", isPrivateProject);
      // console.log("projectIsPrivate", projectIsPrivate);
      // console.log("projectIsPrivate", projectIsPrivate);

      //pass privacy and projectId to be updated.
      // console.log("isPrivateProject", isPrivateProject);

      const config = configWithToken(userInfo.token);
      const { data } = await axios.put(
        `/api/projects/update-privacy/${projectId}`,
        { is_private: projectIsPrivate },
        config
      );
      setResponse(data);
      setIsPrivateProject(projectIsPrivate);
    } catch (error) {
      console.log(error.message);
    }
  };
  // console.log(response);
  useEffect(() => {
    if (response && response.success === false) {
      window.alert(response.message);
    }
  }, [response]);
  return (
    <div
      className="  text-white absolute w-72 rounded-md p-3 z-10"
      style={{ background: "#3F4447" }}
    >
      <button className="absolute right-1 top-1" onClick={() => setOpenPrivacyOptions(false)}>
        <AiOutlineClose size={24} />
      </button>
      <p className="text-2xl">Visibility</p>
      {/* {response && response.success === false && <p className='text-red-400'>{response.message}</p>}
      {response && response.success === true && <p className='text-red-400'>{response.message}</p>} */}
      <p className="text-base">Choose who is able to see this board.</p>
      {projectId ? (
        <button
          className={`${
            isPrivateProject ? "" : "bg-green-300"
          } hover:bg-green-300 transition-all duration-500 rounded-md my-2 p-1`}
          onClick={() => handleUpdatePrivacy(false)}
        >
          <p>Public</p>
          <p>Anyone can see this board. Only board members can edit</p>
        </button>
      ) : (
        <button
          className={`${
            isPrivateProject ? "" : "bg-green-300"
          } hover:bg-green-300 transition-all duration-500 rounded-md my-2 p-1`}
          onClick={() => setIsPrivateProject(false)}
        >
          <p>Public</p>
          <p>Anyone can see this board. Only board members can edit</p>
        </button>
      )}

      {projectId ? (
        <button
          className={`${
            isPrivateProject ? "bg-red-300" : ""
          } hover:bg-red-300 transition-all duration-500 rounded-md my-2 p-1`}
          onClick={() => handleUpdatePrivacy(true)}
        >
          <p>Private</p>
          <p>Only board members can see and edit this board.</p>
        </button>
      ) : (
        <button
          className={`${
            isPrivateProject ? "bg-red-300" : ""
          } hover:bg-red-300 transition-all duration-500 rounded-md my-2 p-1`}
          onClick={() => setIsPrivateProject(true)}
        >
          <p>Private</p>
          <p>Only board members can see and edit this board.</p>
        </button>
      )}
    </div>
  );
};

export default PrivacyOptions;
