import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { DragDropContext, Droppable, resetServerContext } from "react-beautiful-dnd";
import { useDispatch, useSelector } from "react-redux";
import KanbanColumnArray from "../components/kanbanColArray";
import { configWithToken } from "../functions";
import { getBoardColumns, updateCols } from "../redux/Actions/projectActions";
import Loader from "./loader";
import NewColumn from "./newColumn";
import { DarkModeContext } from "../context/darkModeContext";

const Kanban = ({ headerImage, projectId }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const dispatch = useDispatch();
  const userLogin = useSelector((state) => state.userLogin);
  const { userInfo } = userLogin;
  const projectColumns = useSelector((state) => state.projectColumns);
  const { boardColumns, loading } = projectColumns;
  //makes something can load before d&d checks a fail
  const [winReady, setWinReady] = useState(false);
  const [openNewColumn, setOpenNewColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [columns, setColumns] = useState([]);

  //call the get columns data here
  //to make sure it wokrs
  useEffect(async () => {
    setWinReady(true);
    resetServerContext();
  }, []);

  const pushColumnsToDB = async () => {
    if (!userInfo) return;
    // const config = configWithToken(userInfo.token);
    if (projectId) {
      dispatch(updateCols(columns, projectId));
      // const { data } = await axios.put(
      //   `/api/projects/add-column/${projectId}`,
      //   { columns },
      //   config
      // );
      // console.log(data);
      // if (!data.success || data.message) {
      //   window.alert(data.message);
      // }
    }
  };
  // console.log("projectId", projectId);

  // get data from the db here
  useEffect(() => {
    if (projectId) {
      dispatch(getBoardColumns(projectId));
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      if (!boardColumns || !Array.isArray(boardColumns)) return;
      setColumns(boardColumns);
      // console.log("columns:", columns);
    }
  }, [boardColumns]);

  useEffect(async () => {
    // console.log("columns", columns);
    if (!projectId || columns === [] || !columns || columns.length === 0) {
      // console.log("dont update anything");
      return;
    }
    const config = configWithToken(userInfo.token);
    // console.log("columns", columns);
    // console.log("Updated in the db");
    // await dispatch(updateCols(columns, projectId));
    await axios.put(`/api/projects/add-column/${projectId}`, { columns }, config);
    // dispatch(getBoardColumns(projectId));
  }, [columns]);

  // boardColumns && console.log("boardColumns:", boardColumns);
  // console.log("projectId", projectId);
  // console.log("columns", columns);
  // console.log("projectId:", projectId);
  // console.log("userInfo:", userInfo);

  const handleOnDragEnd = async (result) => {
    // console.log("result:", result);
    const { source, destination, type } = result;

    if (!destination) return; //if the card or column doesnt go anywhere do nothing
    //moving columns here
    if (type === "column") {
      const columnCopy = columns.slice(0);

      if (source.index === destination.index) return;
      const [removed] = columnCopy.splice(source.index, 1);
      //   return console.log("moved", removed);
      columnCopy.splice(destination.index, 0, removed);
      // return console.log("colsInarray", columns);
      // console.log("columnCopy:", columnCopy);

      return setColumns(columnCopy);
    }

    // //moving cards here
    // if we are moving items to a different column
    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns.find((col) => col.id == source.droppableId);
      // console.log("src col", source);
      const destinationColumn = columns.find((col) => col.id == destination.droppableId);
      // console.log("destination col", destination);
      const sourceItems = sourceColumn.items;
      //console.log(sourceItems);
      const destinationItems = destinationColumn.items;
      // console.log("destination items", destinationItems);
      // console.log(source.index);
      const [removed] = sourceItems.splice(source.index, 1);
      // console.log("removedTask", removed);
      //add in what was removed from the source col
      // console.log(destinationItems);
      if (destinationItems.length === 0) {
        destinationItems.push(removed);
      } else {
        destinationItems.splice(destination.index, 0, removed);
      }
      const updatedBoardState = columns;
      setColumns(updatedBoardState);
      pushColumnsToDB();
    }
    //re-ordering columns from the same column
    else {
      const column = columns.find((col) => col.id === source.droppableId);

      const copiedItems = [...column.items]; //copy of the tasks inside items array

      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed); //add the removed item
      // console.log("copieditems", copiedItems);
      //array without this column

      for (var i in columns) {
        if (columns[i].id == column.id) {
          columns[i].items = copiedItems;
          break; //Stop this loop, we found it!
        }
      }
      const updatedBoardState = columns;

      setColumns([...updatedBoardState]);
      pushColumnsToDB();
    }
  };
  //whenever columns is updated we update the db
  // console.log(columns);
  return (
    <main className="relative flex-col">
      {loading && <Loader isDarkMode={isDarkMode} />}
      {!loading && (
        <>
          {headerImage && (
            <img
              src={headerImage}
              className="rounded-md w-screen h-64 object-cover mb-3"
              alt="Board header img"
            />
          )}
          {winReady && (
            <DragDropContext onDragEnd={(result) => handleOnDragEnd(result)}>
              <Droppable droppableId={"columns"} type="column" direction="horizontal">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    className={`flex flex-row overflow-x-auto h-auto mb-10 ${
                      isDarkMode ? "darkBody" : "lightBody"
                    }`}
                  >
                    {columns &&
                      columns.map((column, index) => {
                        // console.log("id:", id); // console.log("mappedColumn:", column);
                        return (
                          <div
                            className={`flex flex-col  ${isDarkMode ? "darkBody" : "lightBody"}`}
                            key={index}
                          >
                            <KanbanColumnArray
                              id={column.id}
                              column={column}
                              index={index}
                              setColumns={setColumns}
                              columns={columns}
                              projectId={projectId}
                            />
                          </div>
                        );
                      })}
                    {provided.placeholder}
                    <div className="relative self-start h-96">
                      <button
                        className={`  text-xl my-3  rounded-sm p-1 ${
                          isDarkMode ? "bg-gray-700" : "bg-gray-300"
                        }`}
                        onClick={() => setOpenNewColumn(!openNewColumn)}
                      >
                        + New Column
                      </button>
                      <NewColumn
                        openNewColumn={openNewColumn}
                        setOpenNewColumn={setOpenNewColumn}
                        newColumnTitle={newColumnTitle}
                        setNewColumnTitle={setNewColumnTitle}
                        columns={columns}
                        setColumns={setColumns}
                        projectId={projectId}
                      />
                    </div>
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </>
      )}
    </main>
  );
};

export default Kanban;
