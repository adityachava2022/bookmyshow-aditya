import { message, Table, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../../redux/loaderSlice";
import { getAllMovies } from "../../api/movie";
import React, { useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { DateTime } from "luxon";
import MovieForm from "./MovieForm";
import DeleteMovieModal from "./DeleteMovieModal";
import { setMovies } from "../../redux/moviesSlice";

const MovieList = () => {
  const { movies } = useSelector((state) => state.movies);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [formType, setFormType] = useState("add");
  const dispatch = useDispatch();

  const tableHeadings = [
    {
      title: "Poster",
      dataIndex: "poster",
      render: (text, data) => {
        return (
          <img
            width="75"
            height="115"
            style={{ objectFit: "cover" }}
            src={data?.poster}
          />
        );
      },
    },
    {
      title: "Movie Name",
      dataIndex: "movieName",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Duration",
      dataIndex: "duration",
      render: (text) => {
        return `${text} Min`;
      },
    },
    {
      title: "Genre",
      dataIndex: "genre",
    },
    {
      title: "Language",
      dataIndex: "language",
    },
    {
      title: "Release Date",
      dataIndex: "releaseDate",
      render: (text, data) => {
        return DateTime.fromISO(data.releaseDate).toFormat("MM-dd-yyyy");
      },
    },
    {
      title: "Actions",
      render: (text, data) => {
        return (
          <div>
            <Button
              onClick={() => {
                setIsModalOpen(true);
                setSelectedMovie(data);
                setFormType("edit");
              }}
            >
              <EditOutlined />
            </Button>
            <Button
              onClick={() => {
                setIsDeleteModalOpen(true);
                setSelectedMovie(data);
              }}
            >
              <DeleteOutlined />
            </Button>
          </div>
        );
      },
    },
  ];

  const getData = async () => {
    try {
      dispatch(showLoading());
      const response = await getAllMovies();
      if (response.success) {
        dispatch(
          setMovies(
            response.data.map((item) => {
              return { ...item, key: `movie${item._id}` };
            })
          )
        );
      }
    } catch (error) {
      message.error(error);
    } finally {
      dispatch(hideLoading());
    }
  };

  // load the movies on render - it is a side effect
  useEffect(() => {
    getData();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-end">
        <Button
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          Add Movie
        </Button>
      </div>
      <Table columns={tableHeadings} dataSource={movies} />
      {/* edit movie form */}
      {isModalOpen && (
        <MovieForm
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          selectedMovie={selectedMovie}
          setSelectedMovie={setSelectedMovie}
          getData={getData}
          formType={formType}
        />
      )}
      {/* delete movie form */}
      {isDeleteModalOpen && (
        <DeleteMovieModal
          isDeleteModalOpen={isDeleteModalOpen}
          selectedMovie={selectedMovie}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          setSelectedMovie={setSelectedMovie}
          getData={getData}
        />
      )}
    </div>
  );
};

export default MovieList;
