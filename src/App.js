import { useEffect, useState } from "react";
import "./App.css";
import md5 from "js-md5";
import axios from "axios";
import { MarvelHeros, Logo } from "./assets";

function App() {
  const [heros, setheros] = useState();
  const [offset, setOffset] = useState(0);
  const [totalData, setTotalData] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 12;
  const page = offset / limit + 1;
  // secret keys in .env file
  const BASE_URL = process.env.REACT_APP_API_BASE_URL
  const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY

  const fetchHeros = async (limit, offset) => {
    // Hashing with md5
    const ts = Number(new Date());
    const hash = md5.create();
    hash.update(ts + PRIVATE_KEY + PUBLIC_KEY);

    const { data } = await axios.get(
      `${BASE_URL}/v1/public/characters?ts=${ts}&limit=${limit}&apikey=${PUBLIC_KEY}&hash=${hash.hex()}&offset=${offset}`
    );
    return data
  }

  async function getData() {
    const data = await fetchHeros(limit, offset);
    setheros(data?.data?.results);
    setTotalData(data?.data?.total);
    sessionStorage.setItem(page, JSON.stringify(data?.data?.results));
    sessionStorage.setItem("total", data?.data?.total);
    setLoading(false);
  }
  // Returns true if it exists in data session storage, otherwise returns false
  const isExistSessionStorage = () => {
    const data = JSON.parse(sessionStorage.getItem(page));
    const total = sessionStorage.getItem("total");
    if (!data) return false;
    setheros(data);
    setTotalData(total);
    setLoading(false);
    return true;
  };

  useEffect(() => {
    setLoading(true)
    if (!isExistSessionStorage()) {
      getData();
    }
  }, [offset]);

  const lastPageNumber = totalData / limit;

  const handlePage = (event, info) => {
    const pageNumber = Number(event.target.innerHTML)
    if (info) {
      info === "previous" ? setOffset(prevState => prevState - limit) : setOffset(prevState => prevState + limit)
    } else {
      if (pageNumber <= page) {
        setOffset((prevState) => prevState - (limit * (page - pageNumber)));
      } else {
        setOffset((prevState) => prevState + (limit * (pageNumber - page)));
      }
    }
    window.scrollTo(0, 100)
  };

  return (
    <div id='parent'>
      <div id='header'>
        <img id='allheros' src={MarvelHeros} alt='marvel all heros' />
        <img id='marvel-logo-img' src={Logo} alt='marvel logo' />
      </div>
      {
        // Show animation while fetch data
        loading ? <div id='loading' /> : (
          <>
            {/* component listing heroes */}
            <div id='hero-list'>
              {heros?.map((hero) => (
                <div className='card' key={hero.id}>
                  <div className='divider'></div>
                  <div className='img-frame'>
                    <img
                      className='hero-image'
                      src={hero.thumbnail.path + "." + hero.thumbnail.extension}
                      alt='Apocalypse'
                    />
                    <span id='hero-name'>{hero.name}</span>
                  </div>
                </div>
              ))}
              {/* pagination component */}
              <div id='pagination-section'>
                <div id='pagination'>
                  {
                    page > 4 && <button onClick={(e) => handlePage(e, "previous")}><i className="fa-solid fa-chevron-left"></i></button>
                  }
                  <button className={page === 1 ? "active" : undefined} onClick={handlePage}>1</button>
                  {
                    page < 4 && lastPageNumber > 4 && (
                      <div>
                        <button className={page === 2 ? "active" : undefined} onClick={handlePage}>2</button>
                        <button className={page === 3 ? "active" : undefined} onClick={handlePage}>3</button>
                        <button className={page === 4 ? "active" : undefined} onClick={handlePage}>4</button>
                        <button disabled>...</button>
                      </div>
                    )
                  }
                  {
                    page > 3 && page < (lastPageNumber - 2) && (
                      <div>
                        <button disabled>...</button>
                        <button onClick={handlePage}>{page - 1}</button>
                        <button className='active'>{page}</button>
                        <button onClick={handlePage}>{page + 1}</button>
                        <button disabled>...</button>
                      </div>
                    )
                  }
                  {
                    page > lastPageNumber - 3 && (
                      <div>
                        <button disabled>...</button>
                        <button className={page === lastPageNumber - 3 ? "active" : undefined} onClick={handlePage}>{lastPageNumber - 3}</button>
                        <button className={page === lastPageNumber - 2 ? "active" : undefined} onClick={handlePage}>{lastPageNumber - 2}</button>
                        <button className={page === lastPageNumber - 1 ? "active" : undefined} onClick={handlePage}>{lastPageNumber - 1}</button>
                      </div>
                    )
                  }
                  <button className={page === lastPageNumber ? "active" : undefined} onClick={handlePage}>{lastPageNumber}</button>
                  {
                    page < lastPageNumber - 3 && <button onClick={(e) => handlePage(e, "next")}><i className="fa-solid fa-chevron-right"></i></button>
                  }
                </div>
              </div>
            </div>
          </>
        )
      }

    </div >
  );
}

export default App;
