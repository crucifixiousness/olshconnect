import { IoSearchCircle } from "react-icons/io5";


const Searchbar = ()=>{
  return(
    <div className="searchBar position-relative d-flex align-items-center mb-3 w-100">
      <IoSearchCircle className="searchIcon"/>
      <input type="text" placeholder="Search"/>
    </div>
  )
}
export default Searchbar;