// its a string need to convert in it
const curr_user_id = document.parseInt(getElementById("user_id_field").value)

// form catchs the setReload function as props
const Form = (props) => {
	// in props under name of reloadFunction the setReload function is stored
	const setReload = props.reloadFunction
	const [content, setContent] = React.useState("")

	const post = (e) => {
		e.preventDefault()
		$.post("/post/new", {content : content }, 
			function(data) {
				if(data == "Created"){
					alert("Post created successfully.")
					setReload(cur=>!cur)
				}
				else alert("Error occured.")
				}
			)
	}

	return(
		<section className="mt-8 w-3/4 m-auto bg-white p-12 pt-10 rounded-md">
				<h2 className="text-2xl bold mb-2">Create a Post</h2>
				<form action="/post/new" method="POST"  id="post-form" className="flex flex-row" onSubmit={post}>
				<textarea name="content" placeholder="What's on your mind?" className="border-2 px-3 py-2 w-full"  id="post-content-field"  value={content} onChange={(e)=>{setContent(e.target.value)}}></textarea>
				<button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 float-right min-w-max"><i className="fa-solid fa-paper-plane"></i>Post Now</button>
				</form>
			</section>
	)
}

const Posts = () => {
	const [posts, setPosts] = React.useState([])
	const [reload, setReload] = React.useState(false)

	React.useEffect( ()=>{
		fetch("/post/inciya")
		.then((data) => {
			data.json()
			.then( (final_data) => {
				setPosts(final_data)
			})
		})
		.catch((err) => {
			console.log(err)
		})
	}, [reload])
	// when [] not passed then page was recalled automatically on any rerendering
	
	return (<div>
		{/* setReload was not available in form component hence we pass it as "prop"  to Form component*/}
			<Form reloadFunction={setReload}/>
			
			{posts.map((post, index)=>(

			<div className="mt-8 w-8/12 m-auto bg-white p-12 pt-10 rounded-md flex gap-x-4" key={index}>
					<i className="fa-solid fa-user text-8xl"></i>
					<div className="w-full">
						<div className="flex flex-row justify-between items-center">
							<h3 className="text-lg bold">Poster name</h3>
							<span className="text-gray-400 text-sm">21/8/2022</span>
						</div>
						<p>{post.content}</p>
						<a>Edit {post.user_id}</a>
					</div>
			</div>))}
		</div>
	)
}

// $("#post-form").onSubmit((e)=>{
//     e.preventDefault();
// 	e.stopPropagation();
//    const post_text = $("#post-content-field").val()
// 	// fetch not being used as jquery browser support is better
// 	$.post("/post/new", {content : content }, function(data) {
// 			if(data == "Created"){
// 				if($("#reload").val() == true)$("#reload").val(false)
// 				else $("#reload").val(true)
// 				alert("Post created successfully.")
// 			}
// 			else alert("Error occured.")
// 		})
// })


const root = ReactDOM.createRoot(document.getElementById("app"))
root.render(<Posts></Posts>)