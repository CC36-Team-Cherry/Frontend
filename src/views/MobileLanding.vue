<template>
    <div class="flex flex-col h-full bg-gradient-to-b from-green-300 to-blue-500 text-white gap-3">
        <!-- Header Section -->
        <div class="flex flex-col justify-center items-center py-8 px-4 bg-white text-gray-800 shadow-lg rounded-lg w-11/12 max-w-md mx-auto mt-5">
            <img src="/favicon.png" alt="Breeze Logo" class="h-20 mb-3">
            <h1 class="text-4xl font-extrabold text-blue-500">Breeze</h1>
            <p class="text-sm italic text-gray-500 mt-2 text-center">
                The simple attendance management app
            </p>
            <hr class="border-gray-300 w-full my-4">
            <p class="text-gray-700 text-center">
                Our app eliminates the administrative hassles for small companies and startups in Tokyo.
                With our intuitive and simple user interface, attendance logging and PTO requests simply becomes a 
                <span class="text-blue-500 font-bold">breeze</span>.
            </p>
        </div>

        <!-- Content Section -->
        <div class="flex flex-col justify-start items-start p-6 bg-white shadow-lg rounded-lg w-11/12 max-w-md mx-auto">
            <h2 class="text-2xl font-semibold text-blue-500 mb-3">Why Choose Breeze?</h2>
            <ul class="list-disc pl-5 space-y-2 text-gray-700">
                <li><span class="font-bold">Effortlessly</span> log and track attendance</li>
                <li><span class="font-bold">Quickly</span> and securely onboard new employees</li>
                <li><span class="font-bold">Intuitive</span> design for hassle-free management</li>
            </ul>
        </div>

        <!-- Multi-Select Video -->
        <div class="flex flex-col justify-start items-start p-6 bg-white shadow-lg rounded-lg w-11/12 max-w-md mx-auto">
            <h2 class="text-2xl font-semibold text-blue-500 mb-3">Quick and Easy Multi-Select</h2>
            <video class="w-full rounded" src="/src/assets/multiselectvideo.mp4" autoplay loop muted playsinline></video>
        </div>

        <!-- Footer Section -->
        <div class="flex flex-col items-center p-6 bg-gray-100 shadow-md rounded-lg w-11/12 max-w-md mx-auto text-center">
            <p class="text-gray-800 mb-4">
                Breeze is best experienced on desktop. <br> 
                Come visit us after the demos!
            </p>
        </div>
    </div>
</template>

<script>

</script>