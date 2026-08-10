export default function Admin() {

  return (

    <section className="p-10">

      <h1
        className="
        text-4xl
        font-bold
        "
      >
        Admin Dash
      </h1>


      <div
        className="
        grid
        md:grid-cols-3
        gap-5
        mt-8
        "
      >

        <Card title="Puzzles" />

        <Card title="Statistics" />

        <Card title="Leaderboard" />

      </div>


    </section>

  );

}


function Card(
  {
    title
  }:
  {
    title:string
  }
) {

  return (

    <div
      className="
      rounded-xl
      p-8
      bg-gray-200
      text-black
      dark:bg-gray-700
      dark:text-white
      "
    >

      {title}

    </div>

  );

}